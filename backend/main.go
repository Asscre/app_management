package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"app_management/config"
	"app_management/middleware"
	"app_management/models"
	"app_management/services"
)

func main() {
	// 暂时注释掉数据库初始化
	// config.InitDatabase()

	// 初始化Redis
	config.InitRedis()

	// 创建服务实例
	// appService := services.NewAppService()
	// memberService := services.NewMemberService()
	// authService := services.NewAuthService()
	cacheService := services.NewCacheService()

	r := gin.Default()

	// 配置CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 添加性能监控中间件
	r.Use(middleware.PerformanceMiddleware())

	// API路由组
	api := r.Group("/api/v1")
	{
		// 认证API（无需认证）
		auth := api.Group("/auth")
		{
			auth.POST("/register", func(c *gin.Context) {
				var req models.RegisterRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{
						"code":    400,
						"message": "请求参数错误",
						"error":   err.Error(),
					})
					return
				}

				// 模拟注册成功
				user := &models.User{
					ID:       1,
					Username: req.Username,
					Email:    req.Email,
					Role:     "user",
					Status:   "active",
				}

				c.JSON(http.StatusOK, gin.H{
					"code":    200,
					"message": "注册成功",
					"data":    user,
				})
			})

			auth.POST("/login", func(c *gin.Context) {
				var req models.LoginRequest
				if err := c.ShouldBindJSON(&req); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{
						"code":    400,
						"message": "请求参数错误",
						"error":   err.Error(),
					})
					return
				}

				// 模拟登录验证
				if req.Username == "admin" && req.Password == "password" {
					user := &models.User{
						ID:       1,
						Username: "admin",
						Email:    "admin@example.com",
						Role:     "admin",
						Status:   "active",
					}

					// 生成模拟JWT令牌
					token := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIn0.mock"

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "登录成功",
						"data": gin.H{
							"token": token,
							"user":  user,
						},
					})
				} else {
					c.JSON(http.StatusUnauthorized, gin.H{
						"code":    401,
						"message": "登录失败",
						"error":   "用户名或密码错误",
					})
				}
			})
		}

		// 暂时注释掉认证中间件，直接测试缓存功能
		// protected := api.Group("")
		// protected.Use(middleware.AuthMiddleware())
		protected := api.Group("")
		{
			// 应用管理API
			apps := protected.Group("/apps")
			{
				apps.GET("", func(c *gin.Context) {
					// 尝试从缓存获取
					if cachedData, err := cacheService.GetApplicationsCache(); err == nil {
						c.JSON(http.StatusOK, gin.H{
							"code":    200,
							"message": "success (from cache)",
							"data":    string(cachedData),
						})
						return
					}

					// 模拟数据
					applications := []gin.H{
						{
							"id":            1,
							"name":          "移动端APP",
							"description":   "企业移动应用",
							"latestVersion": "1.2.0",
							"status":        "active",
						},
						{
							"id":            2,
							"name":          "Web管理台",
							"description":   "Web端管理系统",
							"latestVersion": "2.1.0",
							"status":        "active",
						},
					}

					// 缓存数据
					if data, err := json.Marshal(applications); err == nil {
						cacheService.SetApplicationsCache(data)
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success (from database)",
						"data":    applications,
					})
				})

				apps.POST("", func(c *gin.Context) {
					var req struct {
						Name        string `json:"name" binding:"required"`
						Description string `json:"description"`
					}

					if err := c.ShouldBindJSON(&req); err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "请求参数错误",
							"error":   err.Error(),
						})
						return
					}

					// 模拟创建成功
					app := gin.H{
						"id":            3,
						"name":          req.Name,
						"description":   req.Description,
						"latestVersion": "1.0.0",
						"status":        "active",
					}

					// 清除应用缓存
					cacheService.ClearApplicationCache()

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "应用创建成功",
						"data":    app,
					})
				})

				apps.GET("/:id", func(c *gin.Context) {
					id := c.Param("id")
					appID, err := strconv.Atoi(id)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "无效的应用ID",
						})
						return
					}

					// 尝试从缓存获取
					if cachedData, err := cacheService.GetApplicationCache(id); err == nil {
						c.JSON(http.StatusOK, gin.H{
							"code":    200,
							"message": "success (from cache)",
							"data":    string(cachedData),
						})
						return
					}

					// 模拟数据
					app := gin.H{
						"id":            appID,
						"name":          "移动端APP",
						"description":   "企业移动应用",
						"latestVersion": "1.2.0",
						"status":        "active",
					}

					// 缓存数据
					if data, err := json.Marshal(app); err == nil {
						cacheService.SetApplicationCache(id, data)
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success (from database)",
						"data":    app,
					})
				})

				apps.DELETE("/:id", func(c *gin.Context) {
					id := c.Param("id")
					appID, err := strconv.Atoi(id)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "无效的应用ID",
						})
						return
					}

					// 清除相关缓存
					cacheService.ClearApplicationCache()
					cacheService.ClearVersionCache()

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "应用删除成功",
						"data":    gin.H{"deletedId": appID},
					})
				})

				apps.POST("/:id/versions", func(c *gin.Context) {
					id := c.Param("id")
					appID, err := strconv.Atoi(id)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "无效的应用ID",
						})
						return
					}

					var req struct {
						Version     string `json:"version" binding:"required"`
						ChangelogMD string `json:"changelogMd"`
					}

					if err := c.ShouldBindJSON(&req); err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "请求参数错误",
							"error":   err.Error(),
						})
						return
					}

					// 模拟创建成功
					version := gin.H{
						"id":          1,
						"appId":       appID,
						"version":     req.Version,
						"changelogMd": req.ChangelogMD,
					}

					// 清除相关缓存
					cacheService.ClearApplicationCache()
					cacheService.ClearVersionCache()

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "版本创建成功",
						"data":    version,
					})
				})

				apps.GET("/:id/versions", func(c *gin.Context) {
					id := c.Param("id")
					appID, err := strconv.Atoi(id)
					if err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "无效的应用ID",
						})
						return
					}

					// 尝试从缓存获取
					if cachedData, err := cacheService.GetVersionsCache(id); err == nil {
						c.JSON(http.StatusOK, gin.H{
							"code":    200,
							"message": "success (from cache)",
							"data":    string(cachedData),
						})
						return
					}

					// 模拟数据
					versions := []gin.H{
						{
							"id":          1,
							"appId":       appID,
							"version":     "1.2.0",
							"changelogMd": "修复已知问题",
						},
						{
							"id":          2,
							"appId":       appID,
							"version":     "1.1.0",
							"changelogMd": "新增功能",
						},
					}

					// 缓存数据
					if data, err := json.Marshal(versions); err == nil {
						cacheService.SetVersionsCache(id, data)
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success (from database)",
						"data":    versions,
					})
				})
			}

			// 会员管理API
			members := protected.Group("/member")
			{
				members.GET("/levels", func(c *gin.Context) {
					// 尝试从缓存获取
					if cachedData, err := cacheService.GetMemberLevelsCache(); err == nil {
						c.JSON(http.StatusOK, gin.H{
							"code":    200,
							"message": "success (from cache)",
							"data":    string(cachedData),
						})
						return
					}

					// 模拟数据
					levels := []gin.H{
						{
							"id":          1,
							"name":        "普通会员",
							"level":       1,
							"permissions": `{"features": ["basic"], "limits": {"api_calls": 1000}}`,
						},
						{
							"id":          2,
							"name":        "高级会员",
							"level":       2,
							"permissions": `{"features": ["basic", "advanced"], "limits": {"api_calls": 5000}}`,
						},
					}

					// 缓存数据
					if data, err := json.Marshal(levels); err == nil {
						cacheService.SetMemberLevelsCache(data)
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success (from database)",
						"data": gin.H{
							"levels": levels,
						},
					})
				})

				members.PUT("/levels", func(c *gin.Context) {
					var req struct {
						Levels []gin.H `json:"levels" binding:"required"`
					}

					if err := c.ShouldBindJSON(&req); err != nil {
						c.JSON(http.StatusBadRequest, gin.H{
							"code":    400,
							"message": "请求参数错误",
							"error":   err.Error(),
						})
						return
					}

					// 清除会员缓存
					cacheService.ClearMemberCache()

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "会员等级更新成功",
						"data":    req.Levels,
					})
				})
			}

			// 系统API
			system := protected.Group("/system")
			{
				system.GET("/audit-logs", func(c *gin.Context) {
					// 模拟数据
					logs := []gin.H{
						{
							"id":         1,
							"userId":     "admin",
							"userName":   "系统管理员",
							"action":     "create",
							"entityType": "application",
							"entityId":   "1",
							"entityName": "移动端APP",
							"details":    `{"name": "移动端APP", "description": "企业移动应用"}`,
							"ipAddress":  "192.168.1.100",
							"timestamp":  "2024-01-15T10:00:00Z",
							"status":     "success",
						},
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success",
						"data":    logs,
					})
				})

				// 缓存管理API
				system.GET("/cache/stats", func(c *gin.Context) {
					stats, err := cacheService.GetCacheStats()
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "获取缓存统计失败",
							"error":   err.Error(),
						})
						return
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success",
						"data":    stats,
					})
				})

				system.DELETE("/cache/clear", func(c *gin.Context) {
					err := cacheService.ClearAllCache()
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "清除缓存失败",
							"error":   err.Error(),
						})
						return
					}

					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "缓存清除成功",
					})
				})

				// 性能监控API
				system.GET("/performance/stats", func(c *gin.Context) {
					stats := middleware.GetPerformanceStats()
					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "success",
						"data":    stats,
					})
				})

				system.POST("/performance/reset", func(c *gin.Context) {
					middleware.ResetPerformanceStats()
					c.JSON(http.StatusOK, gin.H{
						"code":    200,
						"message": "性能统计已重置",
					})
				})
			}
		}
	}

	log.Println("服务器启动在端口 8080...")
	r.Run(":8080")
}
