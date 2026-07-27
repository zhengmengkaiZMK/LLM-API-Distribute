package controller

import (
	"embed"
	"html/template"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

// TechConfig represents the tech blog configuration with i18n support
type TechConfig struct {
	Site           TechSite                     `json:"site"`
	SupportedLangs []string                    `json:"supportedLangs"`
	DefaultLang    string                      `json:"defaultLang"`
	List           map[string]TechListLocale   `json:"list"`
	UI             map[string]TechUIStrings    `json:"ui"`
	Articles       []TechArticleConfig         `json:"articles"`
}

type TechSite struct {
	Name    string `json:"name"`
	BaseUrl string `json:"baseUrl"`
	Logo    string `json:"logo"`
}

type TechListLocale struct {
	Meta         TechMeta `json:"meta"`
	HeroTitle    string   `json:"heroTitle"`
	HeroSubtitle string   `json:"heroSubtitle"`
}

type TechUIStrings struct {
	Home           string `json:"home"`
	Tech           string `json:"tech"`
	Pricing        string `json:"pricing"`
	About          string `json:"about"`
	ReadMore       string `json:"readMore"`
	BackToList     string `json:"backToList"`
	ComingSoon     string `json:"comingSoon"`
	ComingSoonDesc string `json:"comingSoonDesc"`
	NotFoundTitle  string `json:"notFoundTitle"`
	NotFoundDesc   string `json:"notFoundDesc"`
	BrowseAll      string `json:"browseAll"`
	Copyright      string `json:"copyright"`
}

type TechArticleConfig struct {
	Slug       string                       `json:"slug"`
	CoverImage string                       `json:"coverImage"`
	Author     string                       `json:"author"`
	Date       string                       `json:"date"`
	Locales    map[string]TechArticleLocale `json:"-"` // populated after unmarshal
}

type TechArticleLocale struct {
	Title   string   `json:"title"`
	Summary string   `json:"summary"`
	Meta    TechMeta `json:"meta"`
}

type TechMeta struct {
	Title       string `json:"title"`
	Keywords    string `json:"keywords"`
	Description string `json:"description"`
}

// Template data structs
type TechListPageData struct {
	Site     TechSite
	Meta     TechMeta
	Hero     struct{ Title, Subtitle string }
	UI       TechUIStrings
	Lang     string
	Articles []TechArticleView
}

type TechArticleView struct {
	Slug       string
	Title      string
	Summary    string
	CoverImage string
	Author     string
	Date       string
}

type TechArticlePageData struct {
	Site    TechSite
	Meta    TechMeta
	UI      TechUIStrings
	Lang    string
	Article TechArticleView
	Content template.HTML
}

type TechNotFoundPageData struct {
	Site TechSite
	UI   TechUIStrings
	Lang string
}

var (
	techFS     embed.FS
	techConfig *TechConfig
	techTmpl   *template.Template
)

// InitTechPages initializes the tech blog with the embedded filesystem
func InitTechPages(fs embed.FS) {
	techFS = fs
	loadTechConfig()
	loadTechTemplates()
}

func loadTechConfig() {
	data, err := techFS.ReadFile("tech-pages/config.json")
	if err != nil {
		common.SysLog("failed to read tech config: " + err.Error())
		techConfig = &TechConfig{DefaultLang: "en"}
		return
	}

	// First unmarshal into a raw map to handle dynamic language keys in articles
	var rawConfig map[string]interface{}
	err = common.Unmarshal(data, &rawConfig)
	if err != nil {
		common.SysLog("failed to parse tech config raw: " + err.Error())
		techConfig = &TechConfig{DefaultLang: "en"}
		return
	}

	// Unmarshal into struct
	config := &TechConfig{}
	err = common.Unmarshal(data, config)
	if err != nil {
		common.SysLog("failed to parse tech config: " + err.Error())
		techConfig = &TechConfig{DefaultLang: "en"}
		return
	}

	// Parse article locales from raw data
	if articlesRaw, ok := rawConfig["articles"].([]interface{}); ok {
		for i, artRaw := range articlesRaw {
			if i >= len(config.Articles) {
				break
			}
			artMap, ok := artRaw.(map[string]interface{})
			if !ok {
				continue
			}
			config.Articles[i].Locales = make(map[string]TechArticleLocale)
			for _, lang := range config.SupportedLangs {
				if localeData, exists := artMap[lang]; exists {
					localeBytes, err := common.Marshal(localeData)
					if err != nil {
						continue
					}
					var locale TechArticleLocale
					if err := common.Unmarshal(localeBytes, &locale); err == nil {
						config.Articles[i].Locales[lang] = locale
					}
				}
			}
		}
	}

	if config.DefaultLang == "" {
		config.DefaultLang = "en"
	}

	techConfig = config
}

func loadTechTemplates() {
	listTmpl := generateListTemplate()
	articleTmpl := generateArticleTemplate()
	notFoundTmpl := generateNotFoundTemplate()

	var err error
	techTmpl, err = template.New("list").Parse(listTmpl)
	if err != nil {
		common.SysLog("failed to parse tech list template: " + err.Error())
		return
	}
	_, err = techTmpl.New("article").Parse(articleTmpl)
	if err != nil {
		common.SysLog("failed to parse tech article template: " + err.Error())
		return
	}
	_, err = techTmpl.New("notfound").Parse(notFoundTmpl)
	if err != nil {
		common.SysLog("failed to parse tech notfound template: " + err.Error())
		return
	}
}

// detectTechLang detects user language from Accept-Language header or query param
func detectTechLang(c *gin.Context) string {
	// 1. Check ?lang= query parameter
	if lang := c.Query("lang"); lang != "" {
		for _, supported := range techConfig.SupportedLangs {
			if lang == supported {
				return lang
			}
		}
	}

	// 2. Check Accept-Language header
	acceptLang := c.GetHeader("Accept-Language")
	if acceptLang != "" {
		// Parse first language tag
		parts := strings.Split(acceptLang, ",")
		for _, part := range parts {
			lang := strings.TrimSpace(strings.Split(part, ";")[0])
			// Normalize
			langLower := strings.ToLower(lang)
			if strings.HasPrefix(langLower, "zh") {
				return "zh-CN"
			}
			if strings.HasPrefix(langLower, "en") {
				return "en"
			}
			// Check exact match
			for _, supported := range techConfig.SupportedLangs {
				if strings.EqualFold(lang, supported) {
					return supported
				}
			}
		}
	}

	return techConfig.DefaultLang
}

func getUIStrings(lang string) TechUIStrings {
	if ui, ok := techConfig.UI[lang]; ok {
		return ui
	}
	if ui, ok := techConfig.UI[techConfig.DefaultLang]; ok {
		return ui
	}
	return TechUIStrings{}
}

func getListLocale(lang string) TechListLocale {
	if l, ok := techConfig.List[lang]; ok {
		return l
	}
	if l, ok := techConfig.List[techConfig.DefaultLang]; ok {
		return l
	}
	return TechListLocale{}
}

func getArticleLocale(art *TechArticleConfig, lang string) TechArticleLocale {
	if locale, ok := art.Locales[lang]; ok {
		return locale
	}
	if locale, ok := art.Locales[techConfig.DefaultLang]; ok {
		return locale
	}
	return TechArticleLocale{}
}

// ServeTechList handles GET /tech
func ServeTechList(c *gin.Context) {
	if techConfig == nil || techTmpl == nil {
		c.String(http.StatusInternalServerError, "Tech blog not initialized")
		return
	}

	lang := detectTechLang(c)
	listLocale := getListLocale(lang)
	ui := getUIStrings(lang)

	// Build article views in the detected language
	var articleViews []TechArticleView
	for i := range techConfig.Articles {
		art := &techConfig.Articles[i]
		locale := getArticleLocale(art, lang)
		articleViews = append(articleViews, TechArticleView{
			Slug:       art.Slug,
			Title:      locale.Title,
			Summary:    locale.Summary,
			CoverImage: art.CoverImage,
			Author:     art.Author,
			Date:       art.Date,
		})
	}

	data := TechListPageData{
		Site:     techConfig.Site,
		Meta:     listLocale.Meta,
		UI:       ui,
		Lang:     lang,
		Articles: articleViews,
	}
	data.Hero.Title = listLocale.HeroTitle
	data.Hero.Subtitle = listLocale.HeroSubtitle

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=3600")
	c.Header("Vary", "Accept-Language")
	err := techTmpl.ExecuteTemplate(c.Writer, "list", data)
	if err != nil {
		common.SysLog("failed to render tech list: " + err.Error())
	}
}

// ServeTechArticle handles GET /tech/:slug
func ServeTechArticle(c *gin.Context) {
	if techConfig == nil || techTmpl == nil {
		c.String(http.StatusInternalServerError, "Tech blog not initialized")
		return
	}

	slug := c.Param("slug")
	lang := detectTechLang(c)
	ui := getUIStrings(lang)

	// Find article by slug
	var article *TechArticleConfig
	for i := range techConfig.Articles {
		if techConfig.Articles[i].Slug == slug {
			article = &techConfig.Articles[i]
			break
		}
	}

	if article == nil {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.Status(http.StatusNotFound)
		_ = techTmpl.ExecuteTemplate(c.Writer, "notfound", TechNotFoundPageData{
			Site: techConfig.Site,
			UI:   ui,
			Lang: lang,
		})
		return
	}

	// Try to read localized article content, fallback to default
	contentBytes, err := techFS.ReadFile("tech-pages/articles/" + slug + "." + lang + ".html")
	if err != nil {
		// Fallback to default (no lang suffix = English)
		contentBytes, err = techFS.ReadFile("tech-pages/articles/" + slug + ".html")
		if err != nil {
			c.Header("Content-Type", "text/html; charset=utf-8")
			c.Status(http.StatusNotFound)
			_ = techTmpl.ExecuteTemplate(c.Writer, "notfound", TechNotFoundPageData{
				Site: techConfig.Site,
				UI:   ui,
				Lang: lang,
			})
			return
		}
	}

	locale := getArticleLocale(article, lang)
	artView := TechArticleView{
		Slug:       article.Slug,
		Title:      locale.Title,
		Summary:    locale.Summary,
		CoverImage: article.CoverImage,
		Author:     article.Author,
		Date:       article.Date,
	}

	data := TechArticlePageData{
		Site:    techConfig.Site,
		Meta:    locale.Meta,
		UI:      ui,
		Lang:    lang,
		Article: artView,
		Content: template.HTML(contentBytes), // #nosec G203 - content is from embedded trusted files
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=3600")
	c.Header("Vary", "Accept-Language")
	err = techTmpl.ExecuteTemplate(c.Writer, "article", data)
	if err != nil {
		common.SysLog("failed to render tech article: " + err.Error())
	}
}

// ServeTechAsset handles GET /tech-assets/*filepath
func ServeTechAsset(c *gin.Context) {
	filepath := c.Param("filepath")
	data, err := techFS.ReadFile("tech-pages/assets" + filepath)
	if err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	contentType := "application/octet-stream"
	switch {
	case strings.HasSuffix(filepath, ".css"):
		contentType = "text/css; charset=utf-8"
	case strings.HasSuffix(filepath, ".svg"):
		contentType = "image/svg+xml"
	case strings.HasSuffix(filepath, ".png"):
		contentType = "image/png"
	case strings.HasSuffix(filepath, ".jpg"), strings.HasSuffix(filepath, ".jpeg"):
		contentType = "image/jpeg"
	case strings.HasSuffix(filepath, ".webp"):
		contentType = "image/webp"
	case strings.HasSuffix(filepath, ".js"):
		contentType = "application/javascript"
	}

	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "public, max-age=604800")
	c.Data(http.StatusOK, contentType, data)
}

// ServeTechSitemap handles GET /sitemap-tech.xml
func ServeTechSitemap(c *gin.Context) {
	if techConfig == nil {
		c.String(http.StatusInternalServerError, "Tech blog not initialized")
		return
	}

	baseUrl := techConfig.Site.BaseUrl
	xml := `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>` + baseUrl + `/tech</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="` + baseUrl + `/tech?lang=en"/>
    <xhtml:link rel="alternate" hreflang="zh" href="` + baseUrl + `/tech?lang=zh-CN"/>
  </url>`

	for _, a := range techConfig.Articles {
		xml += `
  <url>
    <loc>` + baseUrl + `/tech/` + a.Slug + `</loc>
    <lastmod>` + a.Date + `</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="` + baseUrl + `/tech/` + a.Slug + `?lang=en"/>
    <xhtml:link rel="alternate" hreflang="zh" href="` + baseUrl + `/tech/` + a.Slug + `?lang=zh-CN"/>
  </url>`
	}

	xml += `
</urlset>`

	c.Header("Content-Type", "application/xml; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=86400")
	c.String(http.StatusOK, xml)
}

// HTML Templates with i18n support
func generateListTemplate() string {
	return `<!DOCTYPE html>
<html lang="{{.Lang}}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{.Meta.Title}}</title>
    <meta name="description" content="{{.Meta.Description}}">
    <meta name="keywords" content="{{.Meta.Keywords}}">
    <link rel="canonical" href="{{.Site.BaseUrl}}/tech">
    <link rel="icon" href="{{.Site.Logo}}">
    <link rel="alternate" hreflang="en" href="{{.Site.BaseUrl}}/tech?lang=en">
    <link rel="alternate" hreflang="zh" href="{{.Site.BaseUrl}}/tech?lang=zh-CN">
    <link rel="alternate" hreflang="x-default" href="{{.Site.BaseUrl}}/tech">

    <!-- Open Graph -->
    <meta property="og:type" content="blog">
    <meta property="og:site_name" content="{{.Site.Name}}">
    <meta property="og:title" content="{{.Meta.Title}}">
    <meta property="og:description" content="{{.Meta.Description}}">
    <meta property="og:url" content="{{.Site.BaseUrl}}/tech">
    <meta property="og:locale" content="{{.Lang}}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{.Meta.Title}}">
    <meta name="twitter:description" content="{{.Meta.Description}}">

    <!-- Structured Data: Blog -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "{{.Site.Name}} Tech Blog",
      "url": "{{.Site.BaseUrl}}/tech",
      "description": "{{.Meta.Description}}",
      "inLanguage": "{{.Lang}}",
      "publisher": {
        "@type": "Organization",
        "name": "{{.Site.Name}}",
        "logo": {
          "@type": "ImageObject",
          "url": "{{.Site.BaseUrl}}{{.Site.Logo}}"
        }
      }
    }
    </script>

    <link rel="stylesheet" href="/tech-assets/style.css">
</head>
<body>
    <header class="tech-header">
        <div class="tech-header-inner">
            <a href="/" class="tech-header-logo">
                <img src="{{.Site.Logo}}" alt="{{.Site.Name}}">
                <span>{{.Site.Name}}</span>
            </a>
            <nav>
                <ul class="tech-header-nav">
                    <li><a href="/">{{.UI.Home}}</a></li>
                    <li><a href="/tech" class="active">{{.UI.Tech}}</a></li>
                    <li><a href="/pricing">{{.UI.Pricing}}</a></li>
                    <li><a href="/about">{{.UI.About}}</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="tech-hero">
        <h1>{{.Hero.Title}}</h1>
        <p>{{.Hero.Subtitle}}</p>
    </section>

    <main>
        {{if .Articles}}
        <section class="tech-grid">
            {{range .Articles}}
            <article class="tech-card">
                <a href="/tech/{{.Slug}}">
                    <img class="tech-card-cover" src="{{.CoverImage}}" alt="{{.Title}}" loading="lazy">
                    <div class="tech-card-body">
                        <h2 class="tech-card-title">{{.Title}}</h2>
                        <p class="tech-card-summary">{{.Summary}}</p>
                        <div class="tech-card-meta">
                            <time datetime="{{.Date}}">{{.Date}}</time>
                            <span class="tech-card-readmore">{{$.UI.ReadMore}} &rarr;</span>
                        </div>
                    </div>
                </a>
            </article>
            {{end}}
        </section>
        {{else}}
        <section class="tech-empty">
            <h2>{{.UI.ComingSoon}}</h2>
            <p>{{.UI.ComingSoonDesc}}</p>
        </section>
        {{end}}
    </main>

    <footer class="tech-footer">
        <p>&copy; 2024-2026 <a href="/">{{.Site.Name}}</a>. {{.UI.Copyright}}</p>
    </footer>
</body>
</html>`
}

func generateArticleTemplate() string {
	return `<!DOCTYPE html>
<html lang="{{.Lang}}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{.Meta.Title}}</title>
    <meta name="description" content="{{.Meta.Description}}">
    <meta name="keywords" content="{{.Meta.Keywords}}">
    <link rel="canonical" href="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}">
    <link rel="icon" href="{{.Site.Logo}}">
    <link rel="alternate" hreflang="en" href="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}?lang=en">
    <link rel="alternate" hreflang="zh" href="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}?lang=zh-CN">
    <link rel="alternate" hreflang="x-default" href="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="{{.Site.Name}}">
    <meta property="og:title" content="{{.Meta.Title}}">
    <meta property="og:description" content="{{.Meta.Description}}">
    <meta property="og:url" content="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}">
    <meta property="og:image" content="{{.Site.BaseUrl}}{{.Article.CoverImage}}">
    <meta property="og:locale" content="{{.Lang}}">
    <meta property="article:published_time" content="{{.Article.Date}}">
    <meta property="article:author" content="{{.Article.Author}}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{.Meta.Title}}">
    <meta name="twitter:description" content="{{.Meta.Description}}">
    <meta name="twitter:image" content="{{.Site.BaseUrl}}{{.Article.CoverImage}}">

    <!-- Structured Data: BlogPosting -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{{.Article.Title}}",
      "description": "{{.Meta.Description}}",
      "url": "{{.Site.BaseUrl}}/tech/{{.Article.Slug}}",
      "datePublished": "{{.Article.Date}}",
      "dateModified": "{{.Article.Date}}",
      "inLanguage": "{{.Lang}}",
      "author": {
        "@type": "Person",
        "name": "{{.Article.Author}}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "{{.Site.Name}}",
        "logo": {
          "@type": "ImageObject",
          "url": "{{.Site.BaseUrl}}{{.Site.Logo}}"
        }
      },
      "image": "{{.Site.BaseUrl}}{{.Article.CoverImage}}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "{{.Site.BaseUrl}}/tech/{{.Article.Slug}}"
      }
    }
    </script>

    <link rel="stylesheet" href="/tech-assets/style.css">
</head>
<body>
    <header class="tech-header">
        <div class="tech-header-inner">
            <a href="/" class="tech-header-logo">
                <img src="{{.Site.Logo}}" alt="{{.Site.Name}}">
                <span>{{.Site.Name}}</span>
            </a>
            <nav>
                <ul class="tech-header-nav">
                    <li><a href="/">{{.UI.Home}}</a></li>
                    <li><a href="/tech" class="active">{{.UI.Tech}}</a></li>
                    <li><a href="/pricing">{{.UI.Pricing}}</a></li>
                    <li><a href="/about">{{.UI.About}}</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="tech-article-container">
        <a href="/tech" class="tech-back-link">&larr; {{.UI.BackToList}}</a>

        <article>
            <header class="tech-article-header">
                <h1>{{.Article.Title}}</h1>
                <div class="tech-article-meta">
                    <span>{{.Article.Author}}</span>
                    <time datetime="{{.Article.Date}}">{{.Article.Date}}</time>
                </div>
            </header>

            <div class="tech-article-content">
                {{.Content}}
            </div>
        </article>
    </main>

    <footer class="tech-footer">
        <p>&copy; 2024-2026 <a href="/">{{.Site.Name}}</a>. {{.UI.Copyright}}</p>
    </footer>
</body>
</html>`
}

func generateNotFoundTemplate() string {
	return `<!DOCTYPE html>
<html lang="{{.Lang}}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{.UI.NotFoundTitle}} | {{.Site.Name}}</title>
    <meta name="robots" content="noindex">
    <link rel="icon" href="{{.Site.Logo}}">
    <link rel="stylesheet" href="/tech-assets/style.css">
</head>
<body>
    <header class="tech-header">
        <div class="tech-header-inner">
            <a href="/" class="tech-header-logo">
                <img src="{{.Site.Logo}}" alt="{{.Site.Name}}">
                <span>{{.Site.Name}}</span>
            </a>
            <nav>
                <ul class="tech-header-nav">
                    <li><a href="/">{{.UI.Home}}</a></li>
                    <li><a href="/tech" class="active">{{.UI.Tech}}</a></li>
                    <li><a href="/pricing">{{.UI.Pricing}}</a></li>
                    <li><a href="/about">{{.UI.About}}</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="tech-not-found">
        <h1>{{.UI.NotFoundTitle}}</h1>
        <p>{{.UI.NotFoundDesc}}</p>
        <a href="/tech">{{.UI.BrowseAll}} &rarr;</a>
    </main>

    <footer class="tech-footer">
        <p>&copy; 2024-2026 <a href="/">{{.Site.Name}}</a>. {{.UI.Copyright}}</p>
    </footer>
</body>
</html>`
}
