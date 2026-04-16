package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

// PromoPopupSetting 弹窗充值促销配置
type PromoPopupSetting struct {
	Enabled  bool    `json:"enabled"`  // 是否启用弹窗
	Amount   int     `json:"amount"`   // 充值金额（默认100）
	Discount float64 `json:"discount"` // 折扣（0.1~1.0，如 0.8 = 八折）
}

// 默认配置
var promoPopupSetting = PromoPopupSetting{
	Enabled:  false,
	Amount:   100,
	Discount: 1.0,
}

func init() {
	// 注册到全局配置管理器
	config.GlobalConfig.Register("promo_popup_setting", &promoPopupSetting)
}

// GetPromoPopupSetting 获取弹窗充值配置
func GetPromoPopupSetting() *PromoPopupSetting {
	return &promoPopupSetting
}
