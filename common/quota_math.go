package common

import "math"

// QuotaFromFloat safely converts a float64 to int with overflow protection.
// If the value exceeds int32 range, it clamps to math.MaxInt32.
// This prevents integer overflow attacks where malicious users craft inputs
// that cause float-to-int conversions to produce negative values.
func QuotaFromFloat(f float64) int {
	if math.IsNaN(f) || math.IsInf(f, 0) {
		return 0
	}
	if f >= float64(math.MaxInt32) {
		return math.MaxInt32
	}
	if f <= float64(math.MinInt32) {
		return math.MinInt32
	}
	return int(f)
}

// QuotaFromDecimalIntPart safely converts a decimal.IntPart() (int64) to int
// with overflow clamping to MaxInt32.
func QuotaFromInt64(v int64) int {
	if v >= math.MaxInt32 {
		return math.MaxInt32
	}
	if v <= math.MinInt32 {
		return math.MinInt32
	}
	return int(v)
}
