# 软件版本管理系统

基于前后端分离架构的软件版本控制与会员服务管理平台，支持应用管理、版本发布、会员权限配置和API服务。

## 🚀 快速开始

### 使用Docker Compose（推荐）

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd app_management
   ```

2. **一键启动**
   ```bash
   ./scripts/start.sh
   ```

3. **访问系统**
   - 前端界面: http://localhost:3000
   - 后端API: http://localhost:8080
   - 数据库: localhost:3306
   - 缓存: localhost:6379

### 手动启动

1. **启动服务**
   ```bash
   docker-compose up -d
   ```

2. **查看服务状态**
   ```bash
   docker-compose ps
   ```

3. **查看日志**
   ```bash
   docker-compose logs -f
   ```

## 🧪 测试

### 运行所有测试
```bash
./scripts/test.sh
```

### 运行后端单元测试
```bash
docker-compose exec backend go test ./... -v
```

### 运行API集成测试
```bash
# 测试健康检查
curl http://localhost:8080/api/v1/health

# 测试应用列表
curl http://localhost:8080/api/v1/apps

# 测试会员等级
curl http://localhost:8080/api/v1/member/levels
```

## 📁 项目结构

```
app_management/
├── frontend/                 # 前端应用 (Next.js)
│   ├── app/                 # 页面组件
│   ├── components/          # 可复用组件
│   ├── lib/                # 工具库
│   └── Dockerfile          # 前端Docker配置
├── backend/                 # 后端应用 (Gin)
│   ├── config/             # 配置文件
│   ├── models/             # 数据模型
│   ├── services/           # 业务服务
│   ├── middleware/         # 中间件
│   └── Dockerfile          # 后端Docker配置
├── scripts/                # 脚本文件
│   ├── start.sh           # 启动脚本
│   ├── test.sh            # 测试脚本
│   └── init.sql           # 数据库初始化
├── docker-compose.yml      # Docker Compose配置
└── README.md              # 项目说明
```

## 🔧 开发环境

### 技术栈

**前端**
- Next.js 15.4.5
- TypeScript
- Tailwind CSS
- shadcn/ui

**后端**
- Gin (Go)
- GORM
- MySQL 8.0
- Redis 7

**部署**
- Docker
- Docker Compose

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ 可用内存

## 📊 功能特性

### 应用管理
- ✅ 应用CRUD操作
- ✅ 版本发布管理
- ✅ 版本历史记录
- ✅ 更新日志管理

### 会员管理
- ✅ 会员等级配置
- ✅ 权限JSON编辑
- ✅ 权限版本对比
- ✅ 审计日志记录

### 系统功能
- ✅ JWT认证
- ✅ 角色权限控制
- ✅ Redis缓存
- ✅ 健康检查

## 🔍 监控与日志

### 查看服务状态
```bash
docker-compose ps
```

### 查看实时日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 健康检查
```bash
# 后端健康检查
curl http://localhost:8080/api/v1/health

# 前端健康检查
curl http://localhost:3000
```

## 🛠️ 常用命令

### 服务管理
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建
docker-compose build
```

### 数据库操作
```bash
# 进入MySQL容器
docker-compose exec mysql mysql -u root -p

# 备份数据库
docker-compose exec mysql mysqldump -u root -p app_management > backup.sql

# 恢复数据库
docker-compose exec -T mysql mysql -u root -p app_management < backup.sql
```

### 缓存操作
```bash
# 进入Redis容器
docker-compose exec redis redis-cli

# 清空缓存
docker-compose exec redis redis-cli FLUSHALL
```

## 🔧 配置说明

### 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root123
DB_NAME=app_management

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-secret-key

# 应用配置
APP_PORT=8080
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 3000 | Next.js应用 |
| 后端 | 8080 | Gin API服务 |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3000
   lsof -i :8080
   
   # 修改docker-compose.yml中的端口映射
   ```

2. **数据库连接失败**
   ```bash
   # 检查MySQL容器状态
   docker-compose logs mysql
   
   # 重启MySQL服务
   docker-compose restart mysql
   ```

3. **缓存连接失败**
   ```bash
   # 检查Redis容器状态
   docker-compose logs redis
   
   # 重启Redis服务
   docker-compose restart redis
   ```

### 日志分析

```bash
# 查看错误日志
docker-compose logs --tail=100 | grep ERROR

# 查看特定时间段的日志
docker-compose logs --since="2024-01-15T10:00:00"
```

## 📈 性能优化

### 缓存策略
- 应用信息缓存: 5分钟TTL
- 会员权限缓存: 30分钟TTL
- 版本列表缓存: 5分钟TTL

### 数据库优化
- 索引优化
- 查询优化
- 连接池配置

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请提交 [Issue](https://github.com/your-repo/issues) 或联系开发团队。 