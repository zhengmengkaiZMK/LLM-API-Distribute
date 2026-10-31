package router

import (
	"embed"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func SetWebRouter(router *gin.Engine, buildFS embed.FS, indexPage []byte, aiTxt []byte) {
	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())

	// Tech blog routes (static HTML, SEO-friendly, served before SPA fallback)
	router.GET("/tech", controller.ServeTechList)
	router.GET("/tech/:slug", controller.ServeTechArticle)
	router.GET("/tech-assets/*filepath", controller.ServeTechAsset)
	router.GET("/sitemap-tech.xml", controller.ServeTechSitemap)
	// Registered before static.Serve and NoRoute. Must not depend on the
	// embedded dist copy of .well-known, which Go embed omits.
	router.GET("/.well-known/ai.txt", controller.ServeAITxt(aiTxt))

	router.Use(static.Serve("/", common.EmbedFolder(buildFS, "web/dist")))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") || strings.HasPrefix(c.Request.RequestURI, "/assets") {
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		page := ApplyPublicSEOShell(indexPage, c.Request.URL.Path)
		c.Data(http.StatusOK, "text/html; charset=utf-8", page)
	})
}
