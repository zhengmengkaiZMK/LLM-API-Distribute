package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

// PopupRechargeSetting 弹窗充值配置（独立于 payment_setting）
type PopupRechargeSetting struct {
	Enabled  bool    `json:"enabled"`  // 是否启用弹窗充值
	Amount   int     `json:"amount"`   // 充值金额（元），可配置，默认100
	Discount float64 `json:"discount"` // 独立折扣率，如 0.8 表示8折，范围 (0, 1]
}

// 默认配置
var popupRechargeSetting = PopupRechargeSetting{
	Enabled:  false,
	Amount:   100,
	Discount: 1.0, // 默认不打折
}

func init() {
	// 注册到全局配置管理器，key 为 "popup_recharge_setting"
	config.GlobalConfig.Register("popup_recharge_setting", &popupRechargeSetting)
}

func GetPopupRechargeSetting() *PopupRechargeSetting {
	return &popupRechargeSetting
}
