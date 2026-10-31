package router

import (
	"os"
	"strings"
	"testing"
)

const sampleIndex = `<!doctype html>
<html lang="zh-CN">
<head>
<title>AI 大模型 API 中转站 - 统一接入 GPT、Claude、Gemini | LingTrue</title>
<meta name="description" content="首页描述" />
<meta name="keywords" content="首页关键词" />
<link rel="canonical" href="https://www.lingtrue.com/" />
<meta property="og:title" content="首页标题" />
<meta property="og:description" content="首页描述" />
<meta property="og:url" content="https://www.lingtrue.com/" />
<meta name="twitter:title" content="首页标题" />
<meta name="twitter:description" content="首页描述" />
</head>
<body>
<noscript id="seo-prerender">
<h1>首页</h1>
</noscript>
<div id="root"></div>
</body>
</html>`

func TestApplyPublicSEOShellPricing(t *testing.T) {
	out := string(ApplyPublicSEOShell([]byte(sampleIndex), "/pricing"))
	if !strings.Contains(out, "<title>AI 模型定价 - GPT、Claude、Gemini 按量价格对比 | LingTrue</title>") {
		t.Fatalf("title not rewritten: %s", out)
	}
	if !strings.Contains(out, `<link rel="canonical" href="https://www.lingtrue.com/pricing" />`) {
		t.Fatalf("canonical not rewritten: %s", out)
	}
	if !strings.Contains(out, `<meta property="og:url" content="https://www.lingtrue.com/pricing" />`) {
		t.Fatalf("og:url not rewritten: %s", out)
	}
	if !strings.Contains(out, "<h1>AI 模型定价</h1>") {
		t.Fatalf("noscript not rewritten: %s", out)
	}
	if !strings.Contains(out, `<div id="root"></div>`) {
		t.Fatal("SPA root was removed")
	}
}

func TestApplyPublicSEOShellLeavesHomepage(t *testing.T) {
	out := string(ApplyPublicSEOShell([]byte(sampleIndex), "/"))
	if out != sampleIndex {
		t.Fatal("homepage shell should stay untouched")
	}
}

func TestApplyPublicSEOShellTrimsSlash(t *testing.T) {
	out := string(ApplyPublicSEOShell([]byte(sampleIndex), "/register/"))
	if !strings.Contains(out, `href="https://www.lingtrue.com/register"`) {
		t.Fatalf("trailing slash not normalized: %s", out)
	}
}

func TestIndexHTMLHasNoFakeHreflang(t *testing.T) {
	body, err := os.ReadFile("../web/index.html")
	if err != nil {
		t.Fatal(err)
	}
	html := string(body)
	if !strings.Contains(html, `<html lang="zh-CN">`) {
		t.Fatal("expected html lang zh-CN")
	}
	for _, bad := range []string{
		`hreflang="en"`,
		`hreflang="ja"`,
		`hreflang="fr"`,
		`hreflang="zh-CN"`,
		`hreflang="x-default"`,
		"https://github.com/QuantumNous/new-api",
		"LINGTRUEAPI",
	} {
		if strings.Contains(html, bad) {
			t.Fatalf("index.html still contains %q", bad)
		}
	}
	for _, want := range []string{
		"https://github.com/zhengmengkaiZMK/LLM-API-Distribute",
		"https://www.lingtrue.com",
		"https://lingtrue.apifox.cn",
		`id="seo-prerender"`,
		`property="og:locale" content="zh_CN"`,
	} {
		if !strings.Contains(html, want) {
			t.Fatalf("index.html missing %q", want)
		}
	}
}

func TestSitemapListsTechArticles(t *testing.T) {
	body, err := os.ReadFile("../web/public/sitemap.xml")
	if err != nil {
		t.Fatal(err)
	}
	xml := string(body)
	required := []string{
		"https://www.lingtrue.com/",
		"https://www.lingtrue.com/pricing",
		"https://www.lingtrue.com/document",
		"https://www.lingtrue.com/about",
		"https://www.lingtrue.com/register",
		"https://www.lingtrue.com/privacy-policy",
		"https://www.lingtrue.com/tech",
		"https://www.lingtrue.com/tech?lang=zh-CN",
		"https://www.lingtrue.com/tech?lang=en",
		"https://www.lingtrue.com/tech/configure-lingtrue-in-cherry-studio",
		"https://www.lingtrue.com/tech/configure-lingtrue-in-cherry-studio?lang=zh-CN",
		"https://www.lingtrue.com/tech/configure-lingtrue-in-cherry-studio?lang=en",
		"https://www.lingtrue.com/tech/choose-ai-api-gateway",
		"https://www.lingtrue.com/tech/choose-ai-api-gateway?lang=zh-CN",
		"https://www.lingtrue.com/tech/choose-ai-api-gateway?lang=en",
		"https://www.lingtrue.com/tech/configure-api-proxy-in-aionui",
		"https://www.lingtrue.com/tech/configure-api-proxy-in-aionui?lang=zh-CN",
		"https://www.lingtrue.com/tech/configure-api-proxy-in-aionui?lang=en",
		"https://www.lingtrue.com/tech/getting-started-with-api",
		"https://www.lingtrue.com/tech/getting-started-with-api?lang=zh-CN",
		"https://www.lingtrue.com/tech/getting-started-with-api?lang=en",
		"https://www.lingtrue.com/tech/model-selection-guide",
		"https://www.lingtrue.com/tech/model-selection-guide?lang=zh-CN",
		"https://www.lingtrue.com/tech/model-selection-guide?lang=en",
		"<lastmod>",
	}
	for _, item := range required {
		if !strings.Contains(xml, item) {
			t.Fatalf("sitemap missing %s", item)
		}
	}
}

func TestRobotsAllowsAICrawlers(t *testing.T) {
	body, err := os.ReadFile("../web/public/robots.txt")
	if err != nil {
		t.Fatal(err)
	}
	text := string(body)
	for _, bot := range []string{"GPTBot", "ClaudeBot", "Google-Extended", "PerplexityBot", "ChatGPT-User"} {
		if !strings.Contains(text, "User-agent: "+bot) {
			t.Fatalf("robots.txt missing %s", bot)
		}
	}
	if strings.Contains(text, "User-agent: GPTBot\nDisallow: /") || strings.Contains(text, "User-agent: ClaudeBot\nDisallow: /") {
		t.Fatal("robots.txt blocks an AI crawler at /")
	}
}
