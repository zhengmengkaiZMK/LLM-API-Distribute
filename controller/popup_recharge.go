package controller

import (
	"fmt"
	"net/url"
	"strconv"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/service"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/QuantumNous/new-api/setting/system_setting"

	"github.com/Calcium-Ion/go-epay/epay"
	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
)

// GetPopupRechargeConfig 获取弹窗充值配置（给普通用户前端使用）
func GetPopupRechargeConfig(c *gin.Context) {
	cfg := operation_setting.GetPopupRechargeSetting()

	data := gin.H{
		"enabled":  cfg.Enabled,
		"amount":   cfg.Amount,
		"discount": cfg.Discount,
	}

	common.ApiSuccess(c, data)
}

// RequestPromoPay 弹窗充值专用支付接口
// 与 RequestEpay 完全隔离：折扣来源独立，不影响原有充值管理功能
func RequestPromoPay(c *gin.Context) {
	var req EpayRequest
	err := c.ShouldBindJSON(&req)
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "参数错误"})
		return
	}

	// 校验：弹窗功能必须启用
	promoSetting := operation_setting.GetPopupRechargeSetting()
	if !promoSetting.Enabled {
		c.JSON(200, gin.H{"message": "error", "data": "促销活动未启用"})
		return
	}

	// 校验：请求金额必须匹配弹窗配置金额
	if int(req.Amount) != promoSetting.Amount {
		c.JSON(200, gin.H{"message": "error", "data": "充值金额不匹配"})
		return
	}

	// 仅允许支付宝和微信
	if req.PaymentMethod != "alipay" && req.PaymentMethod != "wxpay" {
		c.JSON(200, gin.H{"message": "error", "data": "弹窗仅支持支付宝和微信支付"})
		return
	}

	id := c.GetInt("id")
	group, err := model.GetUserGroup(id, true)
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "获取用户分组失败"})
		return
	}

	// 使用弹窗独立折扣计算支付金额（核心区别：不走 payment_setting.AmountDiscount）
	payMoney := getPromoPayMoney(req.Amount, group, promoSetting.Discount)
	if payMoney < 0.01 {
		c.JSON(200, gin.H{"message": "error", "data": "充值金额过低"})
		return
	}

	// 以下逻辑与 RequestEpay 相同，复用 epay 客户端和订单体系
	callBackAddress := service.GetCallbackAddress()
	returnUrl, _ := url.Parse(system_setting.ServerAddress + "/console/log")
	notifyUrl, _ := url.Parse(callBackAddress + "/api/user/epay/notify")
	tradeNo := fmt.Sprintf("%s%d", common.GetRandomString(6), time.Now().Unix())
	tradeNo = fmt.Sprintf("USR%dNO%s", id, tradeNo)
	client := GetEpayClient()
	if client == nil {
		c.JSON(200, gin.H{"message": "error", "data": "当前管理员未配置支付信息"})
		return
	}
	uri, params, err := client.Purchase(&epay.PurchaseArgs{
		Type:           req.PaymentMethod,
		ServiceTradeNo: tradeNo,
		Name:           fmt.Sprintf("PROMO%d", req.Amount),
		Money:          strconv.FormatFloat(payMoney, 'f', 2, 64),
		Device:         epay.PC,
		NotifyUrl:      notifyUrl,
		ReturnUrl:      returnUrl,
	})
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "拉起支付失败"})
		return
	}

	amount := req.Amount
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		dAmount := decimal.NewFromInt(int64(amount))
		dQuotaPerUnit := decimal.NewFromFloat(common.QuotaPerUnit)
		amount = dAmount.Div(dQuotaPerUnit).IntPart()
	}

	topUp := &model.TopUp{
		UserId:        id,
		Amount:        amount,
		Money:         payMoney,
		TradeNo:       tradeNo,
		PaymentMethod: req.PaymentMethod,
		CreateTime:    time.Now().Unix(),
		Status:        "pending",
	}
	err = topUp.Insert()
	if err != nil {
		c.JSON(200, gin.H{"message": "error", "data": "创建订单失败"})
		return
	}
	c.JSON(200, gin.H{"message": "success", "data": params, "url": uri})
}

// getPromoPayMoney 弹窗充值专用支付金额计算
// 折扣来源独立于 getPayMoney()，确保不影响原有充值管理功能
func getPromoPayMoney(amount int64, group string, promoDiscount float64) float64 {
	dAmount := decimal.NewFromInt(amount)
	if operation_setting.GetQuotaDisplayType() == operation_setting.QuotaDisplayTypeTokens {
		dQuotaPerUnit := decimal.NewFromFloat(common.QuotaPerUnit)
		dAmount = dAmount.Div(dQuotaPerUnit)
	}

	topupGroupRatio := common.GetTopupGroupRatio(group)
	if topupGroupRatio == 0 {
		topupGroupRatio = 1
	}

	dTopupGroupRatio := decimal.NewFromFloat(topupGroupRatio)
	dPrice := decimal.NewFromFloat(operation_setting.Price)

	// 关键区别：直接使用弹窗配置的折扣，不查询 AmountDiscount
	discount := promoDiscount
	if discount <= 0 || discount > 1 {
		discount = 1.0
	}
	dDiscount := decimal.NewFromFloat(discount)

	payMoney := dAmount.Mul(dPrice).Mul(dTopupGroupRatio).Mul(dDiscount)
	return payMoney.InexactFloat64()
}
