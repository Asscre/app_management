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
	// 从环境变量获取数据库配置
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "app_management")

	// 构建DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// 配置GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // 开发环境显示SQL日志
	}

	// 连接数据库
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

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

	// 创建数据库索引
	createIndexes()

	log.Println("Database connected successfully")
}

// createIndexes 创建数据库索引
func createIndexes() {
	// 应用表索引
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_applications_name ON applications(name)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at)")

	// 版本表索引
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_versions_app_id ON versions(app_id)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_versions_created_at ON versions(created_at)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_versions_version ON versions(version)")

	// 会员等级表索引
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_member_levels_level ON member_levels(level)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_member_levels_name ON member_levels(name)")

	// 审计日志表索引
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type)")

	// 用户表索引
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
	DB.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")

	log.Println("Database indexes created successfully")
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