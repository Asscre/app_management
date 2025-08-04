package services

import (
	"app_management/config"
	"app_management/models"
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthService 认证服务
type AuthService struct{}

// NewAuthService 创建认证服务实例
func NewAuthService() *AuthService {
	return &AuthService{}
}

// Register 用户注册
func (s *AuthService) Register(req *models.RegisterRequest) (*models.User, error) {
	// 检查用户名是否已存在
	var existingUser models.User
	if err := config.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		return nil, errors.New("用户名已存在")
	}

	// 检查邮箱是否已存在
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("邮箱已存在")
	}

	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// 设置默认角色，如果请求中指定了角色则使用指定的角色
	role := "user"
	if req.Role != "" {
		role = req.Role
	}

	user := &models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Email:    req.Email,
		Role:     role,
		Status:   "active",
	}

	if err := config.DB.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

// Login 用户登录
func (s *AuthService) Login(req *models.LoginRequest) (string, *models.User, error) {
	var user models.User
	if err := config.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	// 验证密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}

	// 检查用户状态
	if user.Status != "active" {
		return "", nil, errors.New("账户已被禁用")
	}

	// 生成JWT令牌
	token, err := s.GenerateJWT(&user)
	if err != nil {
		return "", nil, err
	}

	return token, &user, nil
}

// GenerateJWT 生成JWT令牌
func (s *AuthService) GenerateJWT(user *models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}

	claims := models.JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// ValidateJWT 验证JWT令牌
func (s *AuthService) ValidateJWT(tokenString string) (*models.JWTClaims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}

	token, err := jwt.ParseWithClaims(tokenString, &models.JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*models.JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("无效的令牌")
}

// GetUserByID 根据ID获取用户
func (s *AuthService) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
} 