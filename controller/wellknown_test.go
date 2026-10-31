package controller

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestServeAITxtIsPlainTextNotSPA(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/.well-known/ai.txt", ServeAITxt([]byte("# AI Crawler Policy for LingTrue\nAllow: /\n")))
	r.NoRoute(func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte("<!doctype html><html><title>home</title></html>"))
	})

	req := httptest.NewRequest(http.MethodGet, "/.well-known/ai.txt", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("status %d", w.Code)
	}
	if ct := w.Header().Get("Content-Type"); ct != "text/plain; charset=utf-8" {
		t.Fatalf("content-type %q", ct)
	}
	if strings.Contains(w.Body.String(), "<html>") {
		t.Fatalf("response fell through to SPA html: %s", w.Body.String())
	}
	if !strings.Contains(w.Body.String(), "AI Crawler Policy for LingTrue") {
		t.Fatalf("body %s", w.Body.String())
	}
}

func TestDetectTechLangStableChineseCanonical(t *testing.T) {
	gin.SetMode(gin.TestMode)
	old := techConfig
	t.Cleanup(func() { techConfig = old })
	techConfig = &TechConfig{
		SupportedLangs: []string{"en", "zh-CN", "ja"},
		DefaultLang:    "zh-CN",
	}

	zh, _ := gin.CreateTestContext(httptest.NewRecorder())
	zh.Request = httptest.NewRequest(http.MethodGet, "/tech", nil)
	zh.Request.Header.Set("Accept-Language", "en-US,en;q=0.9")
	if got := detectTechLang(zh); got != "zh-CN" {
		t.Fatalf("canonical lang %s", got)
	}

	en, _ := gin.CreateTestContext(httptest.NewRecorder())
	en.Request = httptest.NewRequest(http.MethodGet, "/tech/getting-started-with-api?lang=en", nil)
	if got := detectTechLang(en); got != "en" {
		t.Fatalf("english lang %s", got)
	}
}

func TestNormalizePublicBrand(t *testing.T) {
	cases := map[string]string{
		"":             "LingTrue",
		"New API":      "LingTrue",
		"LINGTRUEAPI":  "LingTrue",
		"LingTrueAPI":  "LingTrue",
		"LingTrue":     "LingTrue",
		"Acme Gateway": "Acme Gateway",
	}
	for in, want := range cases {
		if got := normalizePublicBrand(in); got != want {
			t.Fatalf("normalizePublicBrand(%q)=%q want %q", in, got, want)
		}
	}
}
