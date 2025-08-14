package services

import (
	"app_management/config"
	"app_management/models"
	"app_management/utils"
	"encoding/json"
	"errors"
	"regexp"

	"gorm.io/gorm"
)

// AppService 应用服务
type AppService struct {
	cacheService *CacheService
}

// NewAppService 创建应用服务实例
func NewAppService() *AppService {
	return &AppService{
		cacheService: NewCacheService(),
	}
}

// GetApplications 获取应用列表
func (s *AppService) GetApplications() ([]models.Application, error) {
	// 从数据库获取，使用优化的查询
	var applications []models.Application
	result := config.DB.
		Select("id, name, description, status, created_at, updated_at").
		Preload("Versions", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, app_id, version, changelog_md, changelog_html, created_at").
				Order("created_at DESC")
		}).
		Order("created_at DESC").
		Find(&applications)

	if result.Error != nil {
		return nil, result.Error
	}

	return applications, nil
}

// CreateApplication 创建应用
func (s *AppService) CreateApplication(name, description string) (*models.Application, error) {
	// 验证应用名称
	if len(name) < 2 || len(name) > 20 {
		return nil, errors.New("应用名称长度必须在2-20个字符之间")
	}

	// 检查应用名称是否已存在
	var existingApp models.Application
	if err := config.DB.Where("name = ?", name).First(&existingApp).Error; err == nil {
		return nil, errors.New("应用名称已存在")
	}

	// 生成API密钥
	apiKey, err := utils.GenerateAPIKey()
	if err != nil {
		return nil, errors.New("生成API密钥失败")
	}

	app := &models.Application{
		Name:        name,
		Description: description,
		Status:      "active",
		APIKey:      apiKey,
	}

	result := config.DB.Create(app)
	if result.Error != nil {
		return nil, result.Error
	}

	// 清除应用列表缓存
	s.cacheService.ClearApplicationCache()

	return app, nil
}

// GetApplication 获取应用详情
func (s *AppService) GetApplication(id uint) (*models.Application, error) {
	// 尝试从缓存获取
	cacheKey := string(rune(id))
	if cachedData, err := s.cacheService.GetApplicationCache(cacheKey); err == nil {
		var app models.Application
		if json.Unmarshal(cachedData, &app) == nil {
			return &app, nil
		}
	}

	// 从数据库获取
	var app models.Application
	result := config.DB.Preload("Versions").First(&app, id)
	if result.Error != nil {
		return nil, result.Error
	}

	// 缓存数据
	if data, err := json.Marshal(app); err == nil {
		s.cacheService.SetApplicationCache(cacheKey, data)
	}

	return &app, nil
}

// DeleteApplication 删除应用
func (s *AppService) DeleteApplication(id uint) error {
	// 检查是否有版本记录
	var count int64
	config.DB.Model(&models.Version{}).Where("app_id = ?", id).Count(&count)
	if count > 0 {
		return errors.New("请先清空版本记录")
	}

	result := config.DB.Delete(&models.Application{}, id)
	if result.Error != nil {
		return result.Error
	}

	// 清除相关缓存
	s.cacheService.ClearApplicationCache()
	s.cacheService.ClearVersionCache()

	return nil
}

// CreateVersion 创建版本
func (s *AppService) CreateVersion(appID uint, version, changelogMD string) (*models.Version, error) {
	// 验证版本号格式
	semverRegex := regexp.MustCompile(`^\d+\.\d+\.\d+$`)
	if !semverRegex.MatchString(version) {
		return nil, errors.New("版本号格式不正确，应为 x.y.z 格式")
	}

	// 检查应用是否存在
	var app models.Application
	if err := config.DB.First(&app, appID).Error; err != nil {
		return nil, errors.New("应用不存在")
	}

	// 检查版本是否已存在
	var existingVersion models.Version
	if err := config.DB.Where("app_id = ? AND version = ?", appID, version).First(&existingVersion).Error; err == nil {
		return nil, errors.New("版本号已存在")
	}

	// 创建版本记录
	newVersion := &models.Version{
		AppID:       appID,
		Version:     version,
		ChangelogMD: changelogMD,
		// 简单的Markdown转HTML
		ChangelogHTML: changelogMD,
	}

	result := config.DB.Create(newVersion)
	if result.Error != nil {
		return nil, result.Error
	}

	// 更新应用的最新版本
	app.LatestVersion = version
	config.DB.Save(&app)

	// 清除相关缓存
	s.cacheService.ClearApplicationCache()
	s.cacheService.ClearVersionCache()

	return newVersion, nil
}

// GetVersions 获取版本列表
func (s *AppService) GetVersions(appID uint) ([]models.Version, error) {
	// 尝试从缓存获取
	cacheKey := string(rune(appID))
	if cachedData, err := s.cacheService.GetVersionsCache(cacheKey); err == nil {
		var versions []models.Version
		if json.Unmarshal(cachedData, &versions) == nil {
			return versions, nil
		}
	}

	// 从数据库获取，使用优化的查询
	var versions []models.Version
	result := config.DB.
		Select("id, app_id, version, changelog_md, changelog_html, created_at").
		Where("app_id = ?", appID).
		Order("created_at DESC").
		Find(&versions)

	if result.Error != nil {
		return nil, result.Error
	}

	// 缓存数据
	if data, err := json.Marshal(versions); err == nil {
		s.cacheService.SetVersionsCache(cacheKey, data)
	}

	return versions, nil
}
