#!/bin/bash

# 软件版本系统 Docker Compose 启动脚本

set -e

echo "🚀 启动软件版本管理系统..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p scripts

# 构建并启动服务
echo "📦 构建Docker镜像..."
docker-compose build

echo "🔄 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 检查健康状态
echo "🏥 检查健康状态..."
for service in mysql redis backend frontend; do
    echo "检查 $service 服务..."
    if docker-compose exec -T $service echo "OK" > /dev/null 2>&1; then
        echo "✅ $service 服务正常"
    else
        echo "❌ $service 服务异常"
    fi
done

echo ""
echo "🎉 系统启动完成！"
echo ""
echo "📱 访问地址："
echo "   前端: http://localhost:3000"
echo "   后端API: http://localhost:8080"
echo "   数据库: localhost:3306"
echo "   缓存: localhost:6379"
echo ""
echo "🔧 常用命令："
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo "   进入容器: docker-compose exec backend sh"
echo ""
echo "🧪 运行测试："
echo "   docker-compose exec backend go test ./... -v"
echo "" 