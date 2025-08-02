package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// PerformanceStats 性能统计
type PerformanceStats struct {
	RequestCount   int64         `json:"requestCount"`
	AverageLatency time.Duration `json:"averageLatency"`
	MaxLatency     time.Duration `json:"maxLatency"`
	MinLatency     time.Duration `json:"minLatency"`
	ErrorCount     int64         `json:"errorCount"`
	SuccessCount   int64         `json:"successCount"`
}

var stats = &PerformanceStats{}

// PerformanceMiddleware 性能监控中间件
func PerformanceMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// 处理请求
		c.Next()

		// 计算延迟
		latency := time.Since(start)
		stats.RequestCount++

		// 更新延迟统计
		if stats.MaxLatency == 0 || latency > stats.MaxLatency {
			stats.MaxLatency = latency
		}
		if stats.MinLatency == 0 || latency < stats.MinLatency {
			stats.MinLatency = latency
		}

		// 计算平均延迟
		totalLatency := stats.AverageLatency*time.Duration(stats.RequestCount-1) + latency
		stats.AverageLatency = totalLatency / time.Duration(stats.RequestCount)

		// 统计成功/错误
		if c.Writer.Status() >= 400 {
			stats.ErrorCount++
		} else {
			stats.SuccessCount++
		}

		// 记录慢查询
		if latency > 500*time.Millisecond {
			log.Printf("SLOW REQUEST: %s %s - %v", c.Request.Method, c.Request.URL.Path, latency)
		}

		// 记录错误
		if c.Writer.Status() >= 500 {
			log.Printf("ERROR: %s %s - Status: %d - %v", c.Request.Method, c.Request.URL.Path, c.Writer.Status(), latency)
		}
	}
}

// GetPerformanceStats 获取性能统计
func GetPerformanceStats() *PerformanceStats {
	return stats
}

// ResetPerformanceStats 重置性能统计
func ResetPerformanceStats() {
	stats = &PerformanceStats{}
} 