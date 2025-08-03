package models

import (
	"time"

	"gorm.io/gorm"
)

// MemberLevel 会员等级模型
type MemberLevel struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	AppID       uint           `json:"appId" gorm:"not null"`
	Name        string         `json:"name" gorm:"size:20;not null"`
	Level       int            `json:"level" gorm:"not null"`
	Permissions string         `json:"permissions" gorm:"type:json"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	Application Application    `json:"application" gorm:"foreignKey:AppID"`
}

// AuditLog 审计日志模型
type AuditLog struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     string         `json:"userId" gorm:"size:50;not null"`
	UserName   string         `json:"userName" gorm:"size:50;not null"`
	Action     string         `json:"action" gorm:"size:20;not null"`
	EntityType string         `json:"entityType" gorm:"size:20"`
	EntityID   string         `json:"entityId" gorm:"size:50"`
	EntityName string         `json:"entityName" gorm:"size:100"`
	Details    string         `json:"details" gorm:"type:json"`
	IPAddress  string         `json:"ipAddress" gorm:"size:45"`
	Timestamp  time.Time      `json:"timestamp"`
	Status     string         `json:"status" gorm:"size:20;default:'success'"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `json:"deletedAt" gorm:"index"`
} 