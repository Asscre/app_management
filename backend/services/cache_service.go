package services

import (
	"time"

	"app_management/config"
)

// CacheService 缓存服务
type CacheService struct{}

// NewCacheService 创建缓存服务实例
func NewCacheService() *CacheService {
	return &CacheService{}
}

// CacheKey 缓存键生成器
type CacheKey struct {
	Prefix string
	ID     string
}

// GenerateKey 生成缓存键
func (c *CacheService) GenerateKey(prefix, id string) string {
	return prefix + ":" + id
}

// GetApplicationsCache 获取应用列表缓存
func (c *CacheService) GetApplicationsCache() ([]byte, error) {
	key := c.GenerateKey("apps", "list")
	data, err := config.GetCache(key)
	if err != nil {
		return nil, err
	}
	return []byte(data), nil
}

// SetApplicationsCache 设置应用列表缓存
func (c *CacheService) SetApplicationsCache(data []byte) error {
	key := c.GenerateKey("apps", "list")
	return config.SetCache(key, string(data), 5*time.Minute)
}

// GetApplicationCache 获取单个应用缓存
func (c *CacheService) GetApplicationCache(id string) ([]byte, error) {
	key := c.GenerateKey("app", id)
	data, err := config.GetCache(key)
	if err != nil {
		return nil, err
	}
	return []byte(data), nil
}

// SetApplicationCache 设置单个应用缓存
func (c *CacheService) SetApplicationCache(id string, data []byte) error {
	key := c.GenerateKey("app", id)
	return config.SetCache(key, string(data), 10*time.Minute)
}

// GetMemberLevelsCache 获取会员等级缓存
func (c *CacheService) GetMemberLevelsCache() ([]byte, error) {
	key := c.GenerateKey("member", "levels")
	data, err := config.GetCache(key)
	if err != nil {
		return nil, err
	}
	return []byte(data), nil
}

// SetMemberLevelsCache 设置会员等级缓存
func (c *CacheService) SetMemberLevelsCache(data []byte) error {
	key := c.GenerateKey("member", "levels")
	return config.SetCache(key, string(data), 30*time.Minute)
}

// GetVersionsCache 获取版本列表缓存
func (c *CacheService) GetVersionsCache(appID string) ([]byte, error) {
	key := c.GenerateKey("versions", appID)
	data, err := config.GetCache(key)
	if err != nil {
		return nil, err
	}
	return []byte(data), nil
}

// SetVersionsCache 设置版本列表缓存
func (c *CacheService) SetVersionsCache(appID string, data []byte) error {
	key := c.GenerateKey("versions", appID)
	return config.SetCache(key, string(data), 5*time.Minute)
}

// ClearApplicationCache 清除应用相关缓存
func (c *CacheService) ClearApplicationCache() error {
	return config.ClearCache("app:*")
}

// ClearMemberCache 清除会员相关缓存
func (c *CacheService) ClearMemberCache() error {
	return config.ClearCache("member:*")
}

// ClearVersionCache 清除版本相关缓存
func (c *CacheService) ClearVersionCache() error {
	return config.ClearCache("versions:*")
}

// ClearAllCache 清除所有缓存
func (c *CacheService) ClearAllCache() error {
	return config.ClearCache("*")
}

// CacheStats 缓存统计
type CacheStats struct {
	HitRate    float64 `json:"hitRate"`
	TotalHits  int64   `json:"totalHits"`
	TotalMiss  int64   `json:"totalMiss"`
	CacheSize  int64   `json:"cacheSize"`
	MemoryUsed int64   `json:"memoryUsed"`
}

// GetCacheStats 获取缓存统计信息
func (c *CacheService) GetCacheStats() (*CacheStats, error) {
	// 这里可以添加缓存统计逻辑
	// 暂时返回模拟数据
	return &CacheStats{
		HitRate:    0.85,
		TotalHits:  1000,
		TotalMiss:  150,
		CacheSize:  100,
		MemoryUsed: 1024 * 1024, // 1MB
	}, nil
} 