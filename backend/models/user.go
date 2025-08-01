package models

import (
	"time"

	"gorm.io/gorm"
	"github.com/golang-jwt/jwt/v5"
)

// User 用户模型
type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"size:50;not null;uniqueIndex"`
	Password  string         `json:"-" gorm:"size:100;not null"` // 不在JSON中返回密码
	Email     string         `json:"email" gorm:"size:100;uniqueIndex"`
	Role      string         `json:"role" gorm:"size:20;default:'user'"`
	Status    string         `json:"status" gorm:"size:20;default:'active'"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=6"`
	Email    string `json:"email" binding:"required,email"`
}

// JWTClaims JWT声明
type JWTClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
} 