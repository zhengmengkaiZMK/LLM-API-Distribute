package controller

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestTechArticlesRender(t *testing.T) {
	gin.SetMode(gin.TestMode)
	InitTechPages(os.DirFS(".."))

	r := gin.New()
	r.GET("/tech", ServeTechList)
	r.GET("/tech/:slug", ServeTechArticle)
	r.GET("/sitemap-tech.xml", ServeTechSitemap)

	cases := []struct {
		path string
		want []string
	}{
		{
			path: "/tech",
			want: []string{
				"在 Cherry Studio 配置 LingTrue",
				"AI API 中转怎么选",
			},
		},
		{
			path: "/tech/configure-lingtrue-in-cherry-studio",
			want: []string{
				"<h1>在 Cherry Studio 配置 LingTrue：Claude 与 GPT 的 OpenAI 兼容接入</h1>",
				"FAQPage",
				"https://www.lingtrue.com/register",
				"https://www.lingtrue.com/pricing",
				"https://www.lingtrue.com/document",
				"https://www.lingtrue.com/v1",
				"claude-sonnet-4-5-20251022",
				"BlogPosting",
			},
		},
		{
			path: "/tech/configure-lingtrue-in-cherry-studio?lang=en",
			want: []string{
				"<h1>Configure LingTrue in Cherry Studio: OpenAI-Compatible Claude and GPT</h1>",
				"FAQPage",
				"https://www.lingtrue.com/register",
			},
		},
		{
			path: "/tech/choose-ai-api-gateway",
			want: []string{
				"<h1>AI API 中转怎么选：模型、兼容协议与成本</h1>",
				"可引用事实",
				"FAQPage",
				"https://www.lingtrue.com/pricing",
				"https://www.lingtrue.com/register",
				"BlogPosting",
			},
		},
		{
			path: "/tech/choose-ai-api-gateway?lang=en",
			want: []string{
				"Facts you can quote",
				"FAQPage",
				"https://www.lingtrue.com/register",
			},
		},
		{
			path: "/sitemap-tech.xml",
			want: []string{
				"https://www.lingtrue.com/tech/configure-lingtrue-in-cherry-studio",
				"https://www.lingtrue.com/tech/choose-ai-api-gateway",
				`hreflang="zh-CN"`,
				`hreflang="en"`,
			},
		},
	}

	for _, tc := range cases {
		w := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, tc.path, nil)
		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("%s status %d", tc.path, w.Code)
		}
		body := w.Body.String()
		for _, want := range tc.want {
			if !strings.Contains(body, want) {
				t.Fatalf("%s missing %q", tc.path, want)
			}
		}
	}
}
