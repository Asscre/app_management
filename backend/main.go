package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"app_management/config"
	"app_management/middleware"
	"app_management/models"
	"app_management/services"
)

func main() {
	// 初始化数据库
	config.InitDatabase()

	// 初始化Redis
	config.InitRedis()

	// 创建服务实例
	appService := services.NewAppService()
	authService := services.NewAuthService()
	memberService := services.NewMemberService()
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

	// 健康检查API
	r.GET("/api/v1/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().Unix(),
		})
	})

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

				// 创建用户
				user, err := authService.Register(&req)
				if err != nil {
					c.JSON(http.StatusBadRequest, gin.H{
						"code":    400,
						"message": "注册失败",
						"error":   err.Error(),
					})
					return
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

				// 验证登录
				token, user, err := authService.Login(&req)
				if err != nil {
					c.JSON(http.StatusUnauthorized, gin.H{
						"code":    401,
						"message": "登录失败",
						"error":   err.Error(),
					})
					return
				}

				c.JSON(http.StatusOK, gin.H{
					"code":    200,
					"message": "登录成功",
					"data": gin.H{
						"token": token,
						"user":  user,
					},
				})
			})
		}

		// 启用认证中间件
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
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

					// 从数据库获取应用列表
					applications, err := appService.GetApplications()
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "获取应用列表失败",
							"error":   err.Error(),
						})
						return
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

					// 创建应用
					app, err := appService.CreateApplication(req.Name, req.Description)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "创建应用失败",
							"error":   err.Error(),
						})
						return
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

					// 从数据库获取应用详情
					app, err := appService.GetApplication(uint(appID))
					if err != nil {
						c.JSON(http.StatusNotFound, gin.H{
							"code":    404,
							"message": "应用不存在",
							"error":   err.Error(),
						})
						return
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

					// 删除应用
					err = appService.DeleteApplication(uint(appID))
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "删除应用失败",
							"error":   err.Error(),
						})
						return
					}

					// 清除相关缓存
					cacheService.ClearApplicationCache()
					cacheService.ClearVersionCache()
					// 强制删除应用列表缓存
					config.DeleteCache("apps:list")

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

					// 创建版本
					version, err := appService.CreateVersion(uint(appID), req.Version, req.ChangelogMD)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "创建版本失败",
							"error":   err.Error(),
						})
						return
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

					// 从数据库获取版本列表
					versions, err := appService.GetVersions(uint(appID))
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "获取版本列表失败",
							"error":   err.Error(),
						})
						return
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

					// 从数据库获取会员等级（暂时使用应用ID 1，后续需要从请求中获取）
					levels, err := memberService.GetMemberLevels(1)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "获取会员等级失败",
							"error":   err.Error(),
						})
						return
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

					// 转换数据格式
					var levels []models.MemberLevel
					for _, level := range req.Levels {
						memberLevel := models.MemberLevel{
							Name:        level["name"].(string),
							Level:       int(level["level"].(float64)),
							Permissions: level["permissions"].(string),
						}
						levels = append(levels, memberLevel)
					}

					// 更新会员等级
					err := memberService.UpdateMemberLevels(levels)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "更新会员等级失败",
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
					// 从数据库获取审计日志
					logs, err := memberService.GetAuditLogs(100)
					if err != nil {
						c.JSON(http.StatusInternalServerError, gin.H{
							"code":    500,
							"message": "获取审计日志失败",
							"error":   err.Error(),
						})
						return
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

	// 外部API（需要API密钥验证）
	external := r.Group("/api/v1/external")
	external.Use(middleware.APIKeyMiddleware())
	{
		// 获取应用最新版本
		external.GET("/version", func(c *gin.Context) {
			app := c.MustGet("app").(*models.Application)

			// 获取最新版本
			var latestVersion models.Version
			if err := config.DB.Where("app_id = ?", app.ID).Order("created_at DESC").First(&latestVersion).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{
					"code":    404,
					"message": "未找到版本信息",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"code":    200,
				"message": "success",
				"data": gin.H{
					"appName":   app.Name,
					"version":   latestVersion.Version,
					"changelog": latestVersion.ChangelogHTML,
					"updatedAt": latestVersion.CreatedAt,
				},
			})
		})

		// 获取应用会员等级信息
		external.GET("/member-levels", func(c *gin.Context) {
			app := c.MustGet("app").(*models.Application)

			// 获取会员等级列表
			var memberLevels []models.MemberLevel
			if err := config.DB.Where("app_id = ?", app.ID).Order("level ASC").Find(&memberLevels).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"code":    500,
					"message": "获取会员等级失败",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"code":    200,
				"message": "success",
				"data": gin.H{
					"appName":      app.Name,
					"memberLevels": memberLevels,
				},
			})
		})
	}

	log.Println("服务器启动在端口 8080...")
	r.Run(":8080")
}
