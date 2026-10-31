package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ServeAITxt returns /.well-known/ai.txt as text/plain.
// The file is not left to the SPA fallback: Go's embed of web/dist skips
// directories whose names start with ".", so web/dist/.well-known would be
// absent from the binary even after Vite copies public/ into dist.
func ServeAITxt(body []byte) gin.HandlerFunc {
	payload := append([]byte(nil), body...)
	return func(c *gin.Context) {
		c.Header("Cache-Control", "public, max-age=86400")
		c.Header("X-Content-Type-Options", "nosniff")
		c.Data(http.StatusOK, "text/plain; charset=utf-8", payload)
	}
}
