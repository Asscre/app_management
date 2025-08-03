package middleware

import (
	"app_management/config"
	"app_management/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIKeyMiddleware API密钥验证中间件
func APIKeyMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头获取API密钥
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "缺少API密钥",
			})
			c.Abort()
			return
		}

		// 验证API密钥
		var app models.Application
		if err := config.DB.Where("api_key = ? AND status = ?", apiKey, "active").First(&app).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"code":    401,
				"message": "无效的API密钥",
			})
			c.Abort()
			return
		}

		// 将应用信息存储到上下文中
		c.Set("app", &app)
		c.Next()
	}
} 