package ratio_setting

import (
	"testing"
)

func TestGetCompletionRatio_UserConfigOverridesHardcoded(t *testing.T) {
	// 初始化默认设置
	InitRatioSettings()

	tests := []struct {
		name          string
		model         string
		userConfig    map[string]float64 // 用户在管理后台设置的补全倍率
		expectedRatio float64
		description   string
	}{
		{
			name:          "自定义模型gpt-5.4，用户设置倍率应生效",
			model:         "gpt-5.4",
			userConfig:    map[string]float64{"gpt-5.4": 3.0},
			expectedRatio: 3.0,
			description:   "gpt-5.4被gpt-5前缀匹配，但用户配置应优先",
		},
		{
			name:          "标准模型gpt-4o，用户设置倍率应生效",
			model:         "gpt-4o",
			userConfig:    map[string]float64{"gpt-4o": 6.0},
			expectedRatio: 6.0,
			description:   "gpt-4o有硬编码倍率4，但用户配置6应优先",
		},
		{
			name:          "标准模型claude-3-5-sonnet，用户设置倍率应生效",
			model:         "claude-3-5-sonnet-20241022",
			userConfig:    map[string]float64{"claude-3-5-sonnet-20241022": 3.0},
			expectedRatio: 3.0,
			description:   "claude-3模型有硬编码倍率5，但用户配置3应优先",
		},
		{
			name:          "标准模型gpt-5，用户设置倍率应生效",
			model:         "gpt-5",
			userConfig:    map[string]float64{"gpt-5": 2.0},
			expectedRatio: 2.0,
			description:   "gpt-5有硬编码倍率8，但用户配置2应优先",
		},
		{
			name:          "含斜杠模型，用户设置倍率应生效",
			model:         "openai/gpt-4o",
			userConfig:    map[string]float64{"openai/gpt-4o": 5.0},
			expectedRatio: 5.0,
			description:   "含/的模型用户配置应生效",
		},
		{
			name:          "无用户配置时，应回退到硬编码值",
			model:         "gpt-4o",
			userConfig:    map[string]float64{},
			expectedRatio: 4,
			description:   "没有用户配置时，应使用硬编码的gpt-4o倍率4",
		},
		{
			name:          "无用户配置且无硬编码匹配，应回退到默认值1",
			model:         "my-custom-model",
			userConfig:    map[string]float64{},
			expectedRatio: 1,
			description:   "完全未知的自定义模型，回退到默认倍率1",
		},
		{
			name:          "gemini模型，用户设置倍率应生效",
			model:         "gemini-2.5-pro",
			userConfig:    map[string]float64{"gemini-2.5-pro": 10.0},
			expectedRatio: 10.0,
			description:   "gemini-2.5-pro有硬编码倍率8，但用户配置10应优先",
		},
		{
			name:          "deepseek模型无硬编码，用户设置倍率应生效",
			model:         "deepseek-chat",
			userConfig:    map[string]float64{"deepseek-chat": 2.0},
			expectedRatio: 2.0,
			description:   "deepseek-chat无硬编码匹配，用户配置2应生效",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// 先清除再重新初始化，确保测试隔离
			completionRatioMap.Clear()
			InitRatioSettings()

			// 模拟用户在管理后台设置补全倍率
			for model, ratio := range tt.userConfig {
				completionRatioMap.Set(model, ratio)
			}

			got := GetCompletionRatio(tt.model)
			if got != tt.expectedRatio {
				t.Errorf("%s: GetCompletionRatio(%q) = %v, want %v",
					tt.description, tt.model, got, tt.expectedRatio)
			}
		})
	}
}

func TestGetCompletionRatio_HardcodedFallback(t *testing.T) {
	// 确保硬编码回退在没有用户配置时仍然正确工作
	completionRatioMap.Clear()
	InitRatioSettings()

	hardcodedTests := []struct {
		model         string
		expectedRatio float64
	}{
		{"gpt-4o", 4},
		{"gpt-4o-2024-05-13", 3},
		{"gpt-5", 8},
		{"gpt-4.5-preview", 2},
		{"gpt-4-turbo", 3},
		{"claude-3-5-sonnet-20241022", 5},
		{"gpt-3.5-turbo", 2}, // gpt-3.5-turbo 先被 gpt- 前缀匹配，返回默认值2
		{"gemini-1.5-pro-latest", 4},
		{"gemini-2.5-pro", 8},
		{"o1", 4},
		{"o3", 4},
		{"my-unknown-model", 1},
	}

	for _, tt := range hardcodedTests {
		t.Run("fallback_"+tt.model, func(t *testing.T) {
			got := GetCompletionRatio(tt.model)
			if got != tt.expectedRatio {
				t.Errorf("GetCompletionRatio(%q) = %v, want %v (hardcoded fallback)",
					tt.model, got, tt.expectedRatio)
			}
		})
	}
}
