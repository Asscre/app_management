package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"app_management/models"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接
func InitDatabase() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		getEnv("DB_USER", "root"),
		getEnv("DB_PASSWORD", ""),
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "3306"),
		getEnv("DB_NAME", "app_management"),
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully")

	// 自动迁移表结构
	err = DB.AutoMigrate(
		&models.User{},
		&models.Application{},
		&models.Version{},
		&models.MemberLevel{},
		&models.AuditLog{},
	)

	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	log.Println("Database migration completed")

	// 创建默认管理员用户
	createDefaultAdmin()
}

// createDefaultAdmin 创建默认管理员用户
func createDefaultAdmin() {
	var count int64
	DB.Model(&models.User{}).Where("username = ?", "admin").Count(&count)
	
	if count == 0 {
		// 这里应该使用加密的密码，暂时使用明文
		adminUser := &models.User{
			Username: "admin",
			Password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
			Email:    "admin@example.com",
			Role:     "admin",
			Status:   "active",
		}
		
		DB.Create(adminUser)
		log.Println("Default admin user created")
	}
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
} 