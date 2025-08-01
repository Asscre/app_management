import { Application, CreateApplicationRequest, CreateVersionRequest, Version } from '@/types/app';
import { mockAppApi, mockMemberApi } from './mockApi';

// API基础配置
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/api/v1' 
  : '/api/v1';

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// 应用管理API
export const appApi = {
  getApplications: (): Promise<Application[]> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: Application[]; message: string}>('/apps').then(res => res.data)
      : mockAppApi.getApplications(),

  createApplication: (data: CreateApplicationRequest): Promise<Application> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: Application; message: string}>('/apps', {
          method: 'POST',
          body: JSON.stringify(data),
        }).then(res => res.data)
      : mockAppApi.createApplication(data),

  deleteApplication: (id: number): Promise<void> =>
    process.env.NODE_ENV === 'development'
      ? request<void>(`/apps/${id}`, { method: 'DELETE' })
      : mockAppApi.deleteApplication(id),

  getApplication: (id: number): Promise<Application> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: Application; message: string}>(`/apps/${id}`).then(res => res.data)
      : mockAppApi.getApplication(id),

  createVersion: (appId: number, data: CreateVersionRequest): Promise<Version> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: Version; message: string}>(`/apps/${appId}/versions`, {
          method: 'POST',
          body: JSON.stringify(data),
        }).then(res => res.data)
      : mockAppApi.createVersion(appId, data),

  getVersions: (appId: number): Promise<Version[]> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: Version[]; message: string}>(`/apps/${appId}/versions`).then(res => res.data)
      : mockAppApi.getVersions(appId),
};

// 会员管理API
export const memberApi = {
  getMemberLevels: (): Promise<any> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: {levels: any[]}; message: string}>('/member/levels').then(res => res.data.levels)
      : mockMemberApi.getMemberLevels(),

  updateMemberLevels: (levels: any[]): Promise<any[]> =>
    process.env.NODE_ENV === 'development'
      ? request<{code: number; data: any[]; message: string}>('/member/levels', {
          method: 'PUT',
          body: JSON.stringify({ levels }),
        }).then(res => res.data)
      : mockMemberApi.updateMemberLevels(levels),
};

// 模拟API（用于生产环境或后端不可用时）
export const mockAppApi = {
  getApplications: async (): Promise<Application[]> => {
    await delay(500);
    return mockApplications;
  },

  createApplication: async (data: CreateApplicationRequest): Promise<Application> => {
    await delay(800);
    if (mockApplications.some(app => app.name === data.name)) {
      throw new Error('应用名称已存在');
    }
    const newApp: Application = {
      id: mockApplications.length + 1,
      name: data.name,
      description: data.description,
      latestVersion: '1.0.0',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockApplications.push(newApp);
    return newApp;
  },

  deleteApplication: async (id: number): Promise<void> => {
    await delay(600);
    const index = mockApplications.findIndex(app => app.id === id);
    if (index === -1) {
      throw new Error('应用不存在');
    }
    mockApplications.splice(index, 1);
  },

  getApplication: async (id: number): Promise<Application> => {
    await delay(300);
    const app = mockApplications.find(app => app.id === id);
    if (!app) {
      throw new Error('应用不存在');
    }
    return app;
  },

  createVersion: async (appId: number, data: CreateVersionRequest): Promise<Version> => {
    await delay(1000);
    
    // 验证版本号格式
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(data.version)) {
      throw new Error('版本号格式不正确，应为 x.y.z 格式');
    }

    const newVersion: Version = {
      id: Math.floor(Math.random() * 1000),
      appId,
      version: data.version,
      changelogMd: data.changelogMd,
      changelogHtml: data.changelogMd, // 简单转换
      createdAt: new Date().toISOString(),
    };

    // 更新应用的最新版本
    const app = mockApplications.find(a => a.id === appId);
    if (app) {
      app.latestVersion = data.version;
      app.updatedAt = new Date().toISOString();
    }

    return newVersion;
  },

  getVersions: async (appId: number): Promise<Version[]> => {
    await delay(400);
    return [
      {
        id: 1,
        appId,
        version: '1.2.0',
        changelogMd: '修复已知问题',
        changelogHtml: '<p>修复已知问题</p>',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        appId,
        version: '1.1.0',
        changelogMd: '新增功能',
        changelogHtml: '<p>新增功能</p>',
        createdAt: new Date().toISOString(),
      },
    ];
  },
};

export const mockMemberApi = {
  getMemberLevels: async (): Promise<any[]> => {
    await delay(300);
    return mockMemberLevels;
  },

  updateMemberLevels: async (levels: any[]): Promise<any[]> => {
    await delay(800);
    // 验证JSON格式
    try {
      levels.forEach(level => {
        JSON.parse(level.permissions);
      });
    } catch (error) {
      throw new Error('权限配置JSON格式错误');
    }
    return levels;
  },
};

// 工具函数
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function simulateError(): boolean {
  return Math.random() < 0.1; // 10% 错误率
}

// 模拟数据
const mockApplications: Application[] = [
  {
    id: 1,
    name: '移动端APP',
    description: '企业移动应用',
    latestVersion: '1.2.0',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 2,
    name: 'Web管理台',
    description: 'Web端管理系统',
    latestVersion: '2.1.0',
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
  {
    id: 3,
    name: 'API服务',
    description: '后端API服务',
    latestVersion: '1.0.5',
    status: 'maintenance',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
  },
];

const mockMemberLevels: any[] = [
  {
    id: 1,
    name: '普通会员',
    level: 1,
    permissions: JSON.stringify({
      features: ['basic'],
      limits: { api_calls: 1000 }
    }),
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '高级会员',
    level: 2,
    permissions: JSON.stringify({
      features: ['basic', 'advanced'],
      limits: { api_calls: 5000 }
    }),
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '企业会员',
    level: 3,
    permissions: JSON.stringify({
      features: ['basic', 'advanced', 'enterprise'],
      limits: { api_calls: 10000 }
    }),
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'VIP会员',
    level: 4,
    permissions: JSON.stringify({
      features: ['basic', 'advanced', 'enterprise', 'vip'],
      limits: { api_calls: 50000 }
    }),
    createdAt: '2024-01-01T00:00:00Z',
  },
]; 