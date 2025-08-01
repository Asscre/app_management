package services

import (
	"testing"

	"app_management/config"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

// AppServiceTestSuite 应用服务测试套件
type AppServiceTestSuite struct {
	suite.Suite
	appService *AppService
}

// SetupSuite 设置测试套件
func (suite *AppServiceTestSuite) SetupSuite() {
	config.SetupTestDB(suite.T())
	config.SetupTestRedis(suite.T())
	suite.appService = NewAppService()
}

// TearDownSuite 清理测试套件
func (suite *AppServiceTestSuite) TearDownSuite() {
	config.CleanupTestDB(suite.T())
}

// SetupTest 设置单个测试
func (suite *AppServiceTestSuite) SetupTest() {
	// 清理测试数据
	config.DB.Exec("DELETE FROM versions")
	config.DB.Exec("DELETE FROM applications")
}

// TestCreateApplication 测试创建应用
func (suite *AppServiceTestSuite) TestCreateApplication() {
	// 测试正常创建
	app, err := suite.appService.CreateApplication("测试应用", "这是一个测试应用")
	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), app)
	assert.Equal(suite.T(), "测试应用", app.Name)
	assert.Equal(suite.T(), "这是一个测试应用", app.Description)
	assert.Equal(suite.T(), "active", app.Status)

	// 测试重复名称
	_, err = suite.appService.CreateApplication("测试应用", "重复名称")
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "应用名称已存在")

	// 测试名称长度验证
	_, err = suite.appService.CreateApplication("A", "名称太短")
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "应用名称长度")

	_, err = suite.appService.CreateApplication("这是一个非常长的应用名称超过了二十个字符的限制", "名称太长")
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "应用名称长度")
}

// TestGetApplications 测试获取应用列表
func (suite *AppServiceTestSuite) TestGetApplications() {
	// 创建测试应用
	_, _ = suite.appService.CreateApplication("应用1", "测试应用1")
	_, _ = suite.appService.CreateApplication("应用2", "测试应用2")

	// 获取应用列表
	apps, err := suite.appService.GetApplications()
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), apps, 2)
	assert.Equal(suite.T(), "应用1", apps[0].Name)
	assert.Equal(suite.T(), "应用2", apps[1].Name)
}

// TestGetApplication 测试获取单个应用
func (suite *AppServiceTestSuite) TestGetApplication() {
	// 创建测试应用
	app, _ := suite.appService.CreateApplication("测试应用", "测试描述")

	// 获取应用详情
	retrievedApp, err := suite.appService.GetApplication(app.ID)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), app.ID, retrievedApp.ID)
	assert.Equal(suite.T(), "测试应用", retrievedApp.Name)

	// 测试不存在的应用
	_, err = suite.appService.GetApplication(999)
	assert.Error(suite.T(), err)
}

// TestDeleteApplication 测试删除应用
func (suite *AppServiceTestSuite) TestDeleteApplication() {
	// 创建测试应用
	app, _ := suite.appService.CreateApplication("待删除应用", "测试删除")

	// 删除应用
	err := suite.appService.DeleteApplication(app.ID)
	assert.NoError(suite.T(), err)

	// 验证应用已删除
	_, err = suite.appService.GetApplication(app.ID)
	assert.Error(suite.T(), err)
}

// TestCreateVersion 测试创建版本
func (suite *AppServiceTestSuite) TestCreateVersion() {
	// 创建测试应用
	app, _ := suite.appService.CreateApplication("版本测试应用", "测试版本功能")

	// 测试正常创建版本
	version, err := suite.appService.CreateVersion(app.ID, "1.0.0", "初始版本")
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "1.0.0", version.Version)
	assert.Equal(suite.T(), "初始版本", version.ChangelogMD)

	// 测试版本号格式验证
	_, err = suite.appService.CreateVersion(app.ID, "invalid", "无效版本号")
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "版本号格式")

	// 测试重复版本号
	_, err = suite.appService.CreateVersion(app.ID, "1.0.0", "重复版本")
	assert.Error(suite.T(), err)
	assert.Contains(suite.T(), err.Error(), "版本号已存在")
}

// TestGetVersions 测试获取版本列表
func (suite *AppServiceTestSuite) TestGetVersions() {
	// 创建测试应用和版本
	app, _ := suite.appService.CreateApplication("版本列表测试", "测试版本列表")
	suite.appService.CreateVersion(app.ID, "1.0.0", "版本1")
	suite.appService.CreateVersion(app.ID, "1.1.0", "版本2")

	// 获取版本列表
	versions, err := suite.appService.GetVersions(app.ID)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), versions, 2)
	assert.Equal(suite.T(), "1.1.0", versions[0].Version) // 按创建时间倒序
	assert.Equal(suite.T(), "1.0.0", versions[1].Version)
}

// 运行测试套件
func TestAppServiceTestSuite(t *testing.T) {
	suite.Run(t, new(AppServiceTestSuite))
}
