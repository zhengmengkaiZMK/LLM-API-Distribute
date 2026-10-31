package router

import (
	"html"
	"regexp"
	"strings"
)

// publicSEOShell is the crawlable head/noscript for an SPA route.
// The React app still mounts on #root; this only replaces the initial HTML
// so non-JS crawlers see the right title, canonical, and a short summary.
type publicSEOShell struct {
	Title       string
	Description string
	Keywords    string
	Noscript    string
}

const publicSiteOrigin = "https://www.lingtrue.com"

// Keep these strings aligned with the SEOHead props on the matching pages.
var publicSEOShells = map[string]publicSEOShell{
	"/pricing": {
		Title:       "AI 模型定价 - GPT、Claude、Gemini 按量价格对比 | LingTrue",
		Description: "对比 35+ AI 模型的按量价格。通过 LingTrue 统一网关使用 GPT、Claude、Gemini，无月费，智能路由帮助降低调用成本。",
		Keywords:    "AI API定价,模型价格,GPT API价格,Claude API价格,Gemini API价格,按量计费,LingTrue",
		Noscript:    pageNoscript("AI 模型定价", "LingTrue 模型广场列出 GPT、Claude、Gemini 等模型的按量价格。按实际 Token 计费，无月费。"),
	},
	"/document": {
		Title:       "AI API 接入文档 - GPT、Claude、Gemini 接口说明 | LingTrue",
		Description: "LingTrue 接入文档，兼容 OpenAI、Anthropic、Google SDK。提供 Python、Node.js、Java、Go 示例，替换 Base URL 即可开始调用。",
		Keywords:    "AI API文档,API接入,GPT API文档,Claude API教程,Gemini API,LingTrue",
		Noscript:    pageNoscript("AI API 接入文档", "将 Base URL 换成 https://www.lingtrue.com/v1，使用 LingTrue API Key 即可调用，兼容 OpenAI、Anthropic、Google SDK。"),
	},
	"/about": {
		Title:       "关于 LingTrue - AI 大模型 API 中转站 | LingTrue",
		Description: "LingTrue 为开发者提供统一的 AI API 网关，接入 GPT、Claude、Gemini 等 35+ 模型，支持智能路由与按量计费。",
		Keywords:    "LingTrue,AI API网关,大模型API中转,关于我们",
		Noscript:    pageNoscript("关于 LingTrue", "LingTrue 是面向中文开发者的 AI 大模型 API 中转站，一个接口接入多种模型。"),
	},
	"/privacy-policy": {
		Title:       "隐私政策 | LingTrue",
		Description: "LingTrue 隐私政策说明我们如何收集、使用与保护账户信息、调用日志和支付相关数据。",
		Keywords:    "LingTrue,隐私政策,个人信息保护",
		Noscript:    pageNoscript("隐私政策", "本页说明 LingTrue 如何处理账户信息、API 调用日志以及支付相关数据。"),
	},
	"/register": {
		Title:       "注册 LingTrue - 获取 AI API 额度 | LingTrue",
		Description: "注册 LingTrue 账户并创建 API Key，按量调用 GPT、Claude、Gemini 等模型。兼容主流 SDK，大约 3 分钟完成接入。",
		Keywords:    "LingTrue注册,AI API注册,API Key,免费额度",
		Noscript:    pageNoscript("注册 LingTrue", "注册账户后可创建 API Key，按量调用 GPT、Claude、Gemini 等模型。"),
	},
	"/user-agreement": {
		Title:       "用户协议 | LingTrue",
		Description: "LingTrue 用户协议说明注册与使用本 AI API 网关服务时的权利与义务。",
		Keywords:    "LingTrue,用户协议,服务条款",
		Noscript:    pageNoscript("用户协议", "使用 LingTrue AI API 网关前，请阅读本用户协议。"),
	},
	"/legal/usage-policy": {
		Title:       "使用政策 | LingTrue",
		Description: "LingTrue 使用政策说明可接受的使用方式、禁止行为，以及使用本 AI API 网关时需要遵守的要求。",
		Keywords:    "LingTrue,使用政策,可接受使用",
		Noscript:    pageNoscript("使用政策", "本页说明 LingTrue AI API 网关的可接受使用范围与禁止行为。"),
	},
	"/legal/supported-regions": {
		Title:       "支持的国家与地区 | LingTrue",
		Description: "查看 LingTrue AI API 网关的服务覆盖范围与支持地区。",
		Keywords:    "LingTrue,支持地区,服务范围",
		Noscript:    pageNoscript("支持的国家与地区", "本页说明 LingTrue AI API 网关的服务覆盖范围。"),
	},
	"/legal/commercial-terms": {
		Title:       "商业服务条款 | LingTrue",
		Description: "LingTrue 商业服务条款说明企业客户的服务协议、计费与数据处理约定。",
		Keywords:    "LingTrue,商业条款,服务协议",
		Noscript:    pageNoscript("商业服务条款", "本页是 LingTrue 面向企业客户的商业服务条款。"),
	},
}

func pageNoscript(h1, paragraph string) string {
	return "\n      <h1>" + html.EscapeString(h1) + "</h1>\n      <p>" + html.EscapeString(paragraph) + "</p>\n      <p><a href=\"" + publicSiteOrigin + "/pricing\">模型定价</a> · <a href=\"" + publicSiteOrigin + "/document\">接入文档</a> · <a href=\"" + publicSiteOrigin + "/tech\">技术博客</a></p>\n    "
}

var (
	reSEOTitle       = regexp.MustCompile(`(?s)<title>.*?</title>`)
	reSEODescription = regexp.MustCompile(`<meta name="description" content="[^"]*"\s*/>`)
	reSEOKeywords    = regexp.MustCompile(`<meta name="keywords" content="[^"]*"\s*/>`)
	reSEOCanonical   = regexp.MustCompile(`<link rel="canonical" href="[^"]*"\s*/>`)
	reSEOOgTitle     = regexp.MustCompile(`<meta property="og:title" content="[^"]*"\s*/>`)
	reSEOOgDesc      = regexp.MustCompile(`<meta property="og:description" content="[^"]*"\s*/>`)
	reSEOOgURL       = regexp.MustCompile(`<meta property="og:url" content="[^"]*"\s*/>`)
	reSEOTwTitle     = regexp.MustCompile(`<meta name="twitter:title" content="[^"]*"\s*/>`)
	reSEOTwDesc      = regexp.MustCompile(`<meta name="twitter:description" content="[^"]*"\s*/>`)
	reSEONoscript    = regexp.MustCompile(`(?s)<noscript id="seo-prerender">.*?</noscript>`)
)

// ApplyPublicSEOShell rewrites the SPA index for known public paths.
// Unknown paths, including the homepage, are returned unchanged.
func ApplyPublicSEOShell(indexHTML []byte, requestPath string) []byte {
	path := normalizePublicPath(requestPath)
	shell, ok := publicSEOShells[path]
	if !ok {
		return indexHTML
	}
	canonical := publicSiteOrigin + path
	page := string(indexHTML)
	page = reSEOTitle.ReplaceAllString(page, "<title>"+html.EscapeString(shell.Title)+"</title>")
	page = replaceOnce(page, reSEODescription, `<meta name="description" content="`+html.EscapeString(shell.Description)+`" />`)
	page = replaceOnce(page, reSEOKeywords, `<meta name="keywords" content="`+html.EscapeString(shell.Keywords)+`" />`)
	page = replaceOnce(page, reSEOCanonical, `<link rel="canonical" href="`+html.EscapeString(canonical)+`" />`)
	page = replaceOnce(page, reSEOOgTitle, `<meta property="og:title" content="`+html.EscapeString(shell.Title)+`" />`)
	page = replaceOnce(page, reSEOOgDesc, `<meta property="og:description" content="`+html.EscapeString(shell.Description)+`" />`)
	page = replaceOnce(page, reSEOOgURL, `<meta property="og:url" content="`+html.EscapeString(canonical)+`" />`)
	page = replaceOnce(page, reSEOTwTitle, `<meta name="twitter:title" content="`+html.EscapeString(shell.Title)+`" />`)
	page = replaceOnce(page, reSEOTwDesc, `<meta name="twitter:description" content="`+html.EscapeString(shell.Description)+`" />`)
	page = reSEONoscript.ReplaceAllString(page, `<noscript id="seo-prerender">`+shell.Noscript+`</noscript>`)
	return []byte(page)
}

func replaceOnce(page string, re *regexp.Regexp, replacement string) string {
	if !re.MatchString(page) {
		return page
	}
	return re.ReplaceAllString(page, replacement)
}

func normalizePublicPath(requestPath string) string {
	path := requestPath
	if path == "" {
		return "/"
	}
	if i := strings.IndexByte(path, '?'); i >= 0 {
		path = path[:i]
	}
	if len(path) > 1 {
		path = strings.TrimRight(path, "/")
	}
	return path
}
