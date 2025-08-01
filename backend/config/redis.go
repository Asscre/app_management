package config

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

// InitRedis 初始化Redis连接
func InitRedis() {
	addr := getEnv("REDIS_HOST", "localhost") + ":" + getEnv("REDIS_PORT", "6379")
	password := getEnv("REDIS_PASSWORD", "")
	db := 0

	RedisClient = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
		PoolSize: 10,
	})

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Redis连接失败: %v", err)
		// 不中断程序，使用内存缓存作为备选
		RedisClient = nil
		return
	}

	log.Println("Redis连接成功")
}

// GetCache 获取缓存
func GetCache(key string) (string, error) {
	if RedisClient == nil {
		return "", redis.Nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return RedisClient.Get(ctx, key).Result()
}

// SetCache 设置缓存
func SetCache(key string, value interface{}, expiration time.Duration) error {
	if RedisClient == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return RedisClient.Set(ctx, key, value, expiration).Err()
}

// DeleteCache 删除缓存
func DeleteCache(key string) error {
	if RedisClient == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return RedisClient.Del(ctx, key).Err()
}

// ClearCache 清空缓存
func ClearCache(pattern string) error {
	if RedisClient == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	keys, err := RedisClient.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}

	if len(keys) > 0 {
		return RedisClient.Del(ctx, keys...).Err()
	}

	return nil
} 