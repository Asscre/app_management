package services

import (
	"encoding/json"
	"app_management/config"
	"app_management/models"
	"errors"
)

// MemberService 会员服务
type MemberService struct {
	cacheService *CacheService
}

// NewMemberService 创建会员服务实例
func NewMemberService() *MemberService {
	return &MemberService{
		cacheService: NewCacheService(),
	}
}

// GetMemberLevels 获取会员等级列表
func (s *MemberService) GetMemberLevels() ([]models.MemberLevel, error) {
	// 尝试从缓存获取
	if cachedData, err := s.cacheService.GetMemberLevelsCache(); err == nil {
		var levels []models.MemberLevel
		if json.Unmarshal(cachedData, &levels) == nil {
			return levels, nil
		}
	}

	// 从数据库获取
	var levels []models.MemberLevel
	result := config.DB.Order("level ASC").Find(&levels)
	if result.Error != nil {
		return nil, result.Error
	}

	// 缓存数据
	if data, err := json.Marshal(levels); err == nil {
		s.cacheService.SetMemberLevelsCache(data)
	}

	return levels, nil
}

// UpdateMemberLevels 更新会员等级
func (s *MemberService) UpdateMemberLevels(levels []models.MemberLevel) error {
	// 验证JSON格式
	for _, level := range levels {
		if level.Permissions != "" {
			var js json.RawMessage
			if err := json.Unmarshal([]byte(level.Permissions), &js); err != nil {
				return errors.New("权限配置JSON格式错误")
			}
		}
	}

	// 清空现有数据并重新插入
	if err := config.DB.Exec("DELETE FROM member_levels").Error; err != nil {
		return err
	}

	for _, level := range levels {
		if err := config.DB.Create(&level).Error; err != nil {
			return err
		}
	}

	// 清除会员相关缓存
	s.cacheService.ClearMemberCache()

	return nil
}

// CreateAuditLog 创建审计日志
func (s *MemberService) CreateAuditLog(log *models.AuditLog) error {
	return config.DB.Create(log).Error
}

// GetAuditLogs 获取审计日志
func (s *MemberService) GetAuditLogs(limit int) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	result := config.DB.Order("created_at DESC").Limit(limit).Find(&logs)
	return logs, result.Error
} 