package models

import (
	"time"

	"gorm.io/gorm"
)

// Application 应用模型
type Application struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Name          string         `json:"name" gorm:"size:20;not null;uniqueIndex"`
	Description   string         `json:"description" gorm:"size:200"`
	LatestVersion string         `json:"latestVersion" gorm:"size:20"`
	Status        string         `json:"status" gorm:"size:20;default:'active'"`
	APIKey        string         `json:"apiKey" gorm:"size:64;uniqueIndex;not null"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	Versions      []Version      `json:"versions" gorm:"foreignKey:AppID"`
	MemberLevels  []MemberLevel  `json:"memberLevels" gorm:"foreignKey:AppID"`
}

// Version 版本模型
type Version struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	AppID         uint           `json:"appId" gorm:"not null"`
	Version       string         `json:"version" gorm:"size:20;not null"`
	ChangelogMD   string         `json:"changelogMd" gorm:"type:text"`
	ChangelogHTML string         `json:"changelogHtml" gorm:"type:text"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	Application   Application    `json:"application" gorm:"foreignKey:AppID"`
} 