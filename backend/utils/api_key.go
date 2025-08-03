package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateAPIKey 生成32字节的API密钥
func GenerateAPIKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
} 