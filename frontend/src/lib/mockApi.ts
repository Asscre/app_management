import { Application, CreateApplicationRequest, CreateVersionRequest, Version } from '@/types/app';

// 模拟数据
let mockApplications: Application[] = [
  {
    id: 1,
    name: "移动端APP",
    description: "企业移动应用，支持iOS和Android平台",
    latestVersion: "1.2.0",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: 2,
    name: "Web管理台",
    description: "基于React的管理后台系统",
    latestVersion: "2.1.3",
    status: "active",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-25T16:45:00Z",
  },
  {
    id: 3,
    name: "API网关",
    description: "微服务API统一入口",
    latestVersion: "1.0.5",
    status: "maintenance",
    createdAt: "2024-01-05T11:00:00Z",
    updatedAt: "2024-01-18T13:20:00Z",
  },
];

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API错误
const simulateError = (probability: number = 0.1) => {
  if (Math.random() < probability) {
    throw new Error('模拟网络错误');
  }
};

export const mockAppApi = {
  // 获取应用列表
  getApplications: async (): Promise<Application[]> => {
    await delay(500);
    simulateError(0.05);
    return [...mockApplications];
  },

  // 创建应用
  createApplication: async (data: CreateApplicationRequest): Promise<Application> => {
    await delay(800);
    simulateError(0.1);
    
    // 检查名称是否重复
    if (mockApplications.some(app => app.name === data.name)) {
      throw new Error('应用名称已存在');
    }

    const newApp: Application = {
      id: Math.max(...mockApplications.map(app => app.id)) + 1,
      name: data.name,
      description: data.description || '',
      latestVersion: "0.1.0",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockApplications.push(newApp);
    return newApp;
  },

  // 删除应用
  deleteApplication: async (id: number): Promise<void> => {
    await delay(600);
    simulateError(0.15);
    
    const index = mockApplications.findIndex(app => app.id === id);
    if (index === -1) {
      throw new Error('应用不存在');
    }

    mockApplications.splice(index, 1);
  },

  // 获取应用详情
  getApplication: async (id: number): Promise<Application> => {
    await delay(300);
    simulateError(0.05);
    
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      throw new Error('应用不存在');
    }
    
    return app;
  },

  // 发布版本
  createVersion: async (appId: number, data: CreateVersionRequest): Promise<Version> => {
    await delay(1000);
    simulateError(0.1);
    
    const app = mockApplications.find(app => app.id === appId);
    if (!app) {
      throw new Error('应用不存在');
    }

    // 验证版本号格式 (semver)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(data.version)) {
      throw new Error('版本号格式不正确，应为 x.y.z 格式');
    }

    const newVersion: Version = {
      id: Math.floor(Math.random() * 10000),
      appId,
      version: data.version,
      changelogMd: data.changelogMd,
      changelogHtml: `<div>${data.changelogMd}</div>`,
      createdAt: new Date().toISOString(),
    };

    // 更新应用的最新版本
    app.latestVersion = data.version;
    app.updatedAt = new Date().toISOString();

    return newVersion;
  },

  // 获取应用版本列表
  getVersions: async (appId: number): Promise<Version[]> => {
    await delay(400);
    simulateError(0.05);
    
    // 模拟版本数据
    return [
      {
        id: 1,
        appId,
        version: "1.2.0",
        changelogMd: "修复已知问题，提升性能",
        changelogHtml: "<div>修复已知问题，提升性能</div>",
        createdAt: "2024-01-20T14:30:00Z",
      },
      {
        id: 2,
        appId,
        version: "1.1.0",
        changelogMd: "新增用户管理功能",
        changelogHtml: "<div>新增用户管理功能</div>",
        createdAt: "2024-01-15T10:00:00Z",
      },
    ];
  },
}; 