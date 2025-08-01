package config

import (
	"context"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

// SetupTestDB 设置测试数据库
func SetupTestDB(t *testing.T) {
	// 设置测试环境变量
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "3306")
	os.Setenv("DB_USER", "root")
	os.Setenv("DB_PASSWORD", "")
	os.Setenv("DB_NAME", "app_management_test")
	os.Setenv("REDIS_HOST", "localhost")
	os.Setenv("REDIS_PORT", "6379")

	// 初始化测试数据库
	InitDatabase()
	InitRedis()

	// 验证连接
	assert.NotNil(t, DB, "数据库连接应该成功")
}

// CleanupTestDB 清理测试数据库
func CleanupTestDB(t *testing.T) {
	if DB != nil {
		// 清理测试数据
		DB.Exec("DELETE FROM versions")
		DB.Exec("DELETE FROM applications")
		DB.Exec("DELETE FROM member_levels")
		DB.Exec("DELETE FROM audit_logs")
		DB.Exec("DELETE FROM users")
	}
}

// SetupTestRedis 设置测试Redis
func SetupTestRedis(t *testing.T) {
	// 清理测试缓存
	if RedisClient != nil {
		RedisClient.FlushAll(context.Background())
	}
}
