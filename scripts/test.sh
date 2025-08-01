#!/bin/bash

# 软件版本系统测试脚本

set -e

echo "🧪 开始运行测试..."

# 检查服务是否运行
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ 服务未运行，请先启动服务：./scripts/start.sh"
    exit 1
fi

echo "📋 运行后端单元测试..."
docker-compose exec -T backend go test ./... -v

echo "🔍 运行API集成测试..."
# 等待服务完全启动
sleep 10

# 测试健康检查
echo "🏥 测试健康检查..."
curl -f http://localhost:8080/api/v1/health || echo "❌ 后端健康检查失败"

# 测试应用列表API
echo "📱 测试应用列表API..."
curl -f http://localhost:8080/api/v1/apps || echo "❌ 应用列表API测试失败"

# 测试会员等级API
echo "👥 测试会员等级API..."
curl -f http://localhost:8080/api/v1/member/levels || echo "❌ 会员等级API测试失败"

echo ""
echo "✅ 测试完成！"
echo ""
echo "📊 测试结果："
echo "   后端单元测试: 完成"
echo "   API集成测试: 完成"
echo "   健康检查: 完成"
echo "" 