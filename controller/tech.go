package controller

import (
	"embed"
	"html/template"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

// TechConfig represents the tech blog configuration
type TechConfig struct {
	Site     TechSite       `json:"site"`
	List     TechListConfig `json:"list"`
	Articles []TechArticle  `json:"articles"`
}

type TechSite struct {
	Name    string `json:"name"`
	BaseUrl string `json:"baseUrl"`
	Logo    string `json:"logo"`
}

type TechListConfig struct {
	Meta TechMeta `json:"meta"`
}

type TechArticle struct {
	Slug       string   `json:"slug"`
	Title      string   `json:"title"`
	Summary    string   `json:"summary"`
	CoverImage string   `json:"coverImage"`
	Author     string   `json:"author"`
	Date       string   `json:"date"`
	Meta       TechMeta `json:"meta"`
}

type TechMeta struct {
	Title       string `json:"title"`
	Keywords    string `json:"keywords"`
	Description string `json:"description"`
}

// TechPageData is passed to templates
type TechListPageData struct {
	Site     TechSite
	Meta     TechMeta
	Articles []TechArticle
}

type TechArticlePageData struct {
	Site    TechSite
	Article TechArticle
	Content template.HTML
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
		techConfig = &TechConfig{}
		return
	}
	config := &TechConfig{}
	err = common.Unmarshal(data, config)
	if err != nil {
		common.SysLog("failed to parse tech config: " + err.Error())
		techConfig = &TechConfig{}
		return
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

// ServeTechList handles GET /tech
func ServeTechList(c *gin.Context) {
	if techConfig == nil || techTmpl == nil {
		c.String(http.StatusInternalServerError, "Tech blog not initialized")
		return
	}

	// Only show published articles (all articles in config are published)
	data := TechListPageData{
		Site:     techConfig.Site,
		Meta:     techConfig.List.Meta,
		Articles: techConfig.Articles,
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=3600")
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

	// Find article by slug
	var article *TechArticle
	for i := range techConfig.Articles {
		if techConfig.Articles[i].Slug == slug {
			article = &techConfig.Articles[i]
			break
		}
	}

	if article == nil {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.Status(http.StatusNotFound)
		_ = techTmpl.ExecuteTemplate(c.Writer, "notfound", TechListPageData{
			Site: techConfig.Site,
		})
		return
	}

	// Read article content HTML
	contentBytes, err := techFS.ReadFile("tech-pages/articles/" + slug + ".html")
	if err != nil {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.Status(http.StatusNotFound)
		_ = techTmpl.ExecuteTemplate(c.Writer, "notfound", TechListPageData{
			Site: techConfig.Site,
		})
		return
	}

	data := TechArticlePageData{
		Site:    techConfig.Site,
		Article: *article,
		Content: template.HTML(contentBytes), // #nosec G203 - content is from embedded trusted files
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=3600")
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

	// Determine content type
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
	c.Header("Cache-Control", "public, max-age=604800") // 7 days
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
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>` + baseUrl + `/tech</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`

	for _, a := range techConfig.Articles {
		xml += `
  <url>
    <loc>` + baseUrl + `/tech/` + a.Slug + `</loc>
    <lastmod>` + a.Date + `</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
	}

	xml += `
</urlset>`

	c.Header("Content-Type", "application/xml; charset=utf-8")
	c.Header("Cache-Control", "public, max-age=86400")
	c.String(http.StatusOK, xml)
}

// HTML Templates (embedded as Go strings to avoid extra template files)
func generateListTemplate() string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{.Meta.Title}}</title>
    <meta name="description" content="{{.Meta.Description}}">
    <meta name="keywords" content="{{.Meta.Keywords}}">
    <link rel="canonical" href="{{.Site.BaseUrl}}/tech">
    <link rel="icon" href="{{.Site.Logo}}">

    <!-- Open Graph -->
    <meta property="og:type" content="blog">
    <meta property="og:site_name" content="{{.Site.Name}}">
    <meta property="og:title" content="{{.Meta.Title}}">
    <meta property="og:description" content="{{.Meta.Description}}">
    <meta property="og:url" content="{{.Site.BaseUrl}}/tech">
    <meta property="og:image" content="{{.Site.BaseUrl}}/cover-4.webp">

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
                    <li><a href="/">Home</a></li>
                    <li><a href="/tech" class="active">Tech</a></li>
                    <li><a href="/pricing">Pricing</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="tech-hero">
        <h1>Tech Blog</h1>
        <p>Explore AI technology frontiers, integration guides, and best practices</p>
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
                            <span class="tech-card-readmore">Read more &rarr;</span>
                        </div>
                    </div>
                </a>
            </article>
            {{end}}
        </section>
        {{else}}
        <section class="tech-empty">
            <h2>Coming Soon</h2>
            <p>We're working on some great content. Check back soon!</p>
        </section>
        {{end}}
    </main>

    <footer class="tech-footer">
        <p>&copy; 2024-2026 <a href="/">{{.Site.Name}}</a>. All rights reserved.</p>
    </footer>
</body>
</html>`
}

func generateArticleTemplate() string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{.Article.Meta.Title}}</title>
    <meta name="description" content="{{.Article.Meta.Description}}">
    <meta name="keywords" content="{{.Article.Meta.Keywords}}">
    <link rel="canonical" href="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}">
    <link rel="icon" href="{{.Site.Logo}}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="{{.Site.Name}}">
    <meta property="og:title" content="{{.Article.Meta.Title}}">
    <meta property="og:description" content="{{.Article.Meta.Description}}">
    <meta property="og:url" content="{{.Site.BaseUrl}}/tech/{{.Article.Slug}}">
    <meta property="og:image" content="{{.Site.BaseUrl}}{{.Article.CoverImage}}">
    <meta property="article:published_time" content="{{.Article.Date}}">
    <meta property="article:author" content="{{.Article.Author}}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{.Article.Meta.Title}}">
    <meta name="twitter:description" content="{{.Article.Meta.Description}}">
    <meta name="twitter:image" content="{{.Site.BaseUrl}}{{.Article.CoverImage}}">

    <!-- Structured Data: BlogPosting -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{{.Article.Title}}",
      "description": "{{.Article.Meta.Description}}",
      "url": "{{.Site.BaseUrl}}/tech/{{.Article.Slug}}",
      "datePublished": "{{.Article.Date}}",
      "dateModified": "{{.Article.Date}}",
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
                    <li><a href="/">Home</a></li>
                    <li><a href="/tech" class="active">Tech</a></li>
                    <li><a href="/pricing">Pricing</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="tech-article-container">
        <a href="/tech" class="tech-back-link">&larr; Back to Tech Blog</a>

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
        <p>&copy; 2024-2026 <a href="/">{{.Site.Name}}</a>. All rights reserved.</p>
    </footer>
</body>
</html>`
}

func generateNotFoundTemplate() string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Article Not Found | {{.Site.Name}}</title>
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
                    <li><a href="/">Home</a></li>
                    <li><a href="/tech" class="active">Tech</a></li>
                    <li><a href="/pricing">Pricing</a></li>
                    <li><a href="/about">About</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="tech-not-found">
        <h1>404</h1>
        <p>The article you're looking for doesn't exist.</p>
        <a href="/tech">Browse all articles &rarr;</a>
    </main>

    <footer class="tech-footer">
        <p>&copy; 2024-2026 <a href="/">{{.Site.Name}}</a>. All rights reserved.</p>
    </footer>
</body>
</html>`
}
