import { Application, CreateApplicationRequest, CreateVersionRequest, Version } from '@/types/app';
import { mockAppApi } from './mockApi';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

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
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// 应用管理API
export const appApi = {
  // 获取应用列表
  getApplications: (): Promise<Application[]> => 
    process.env.NODE_ENV === 'development' 
      ? mockAppApi.getApplications()
      : request<Application[]>('/apps'),

  // 创建应用
  createApplication: (data: CreateApplicationRequest): Promise<Application> =>
    process.env.NODE_ENV === 'development'
      ? mockAppApi.createApplication(data)
      : request<Application>('/apps', {
          method: 'POST',
          body: JSON.stringify(data),
        }),

  // 删除应用
  deleteApplication: (id: number): Promise<void> =>
    process.env.NODE_ENV === 'development'
      ? mockAppApi.deleteApplication(id)
      : request<void>(`/apps/${id}`, {
          method: 'DELETE',
        }),

  // 获取应用详情
  getApplication: (id: number): Promise<Application> =>
    process.env.NODE_ENV === 'development'
      ? mockAppApi.getApplication(id)
      : request<Application>(`/apps/${id}`),

  // 发布版本
  createVersion: (appId: number, data: CreateVersionRequest): Promise<Version> =>
    process.env.NODE_ENV === 'development'
      ? mockAppApi.createVersion(appId, data)
      : request<Version>(`/apps/${appId}/versions`, {
          method: 'POST',
          body: JSON.stringify(data),
        }),

  // 获取应用版本列表
  getVersions: (appId: number): Promise<Version[]> =>
    process.env.NODE_ENV === 'development'
      ? mockAppApi.getVersions(appId)
      : request<Version[]>(`/apps/${appId}/versions`),
};

// 会员管理API
export const memberApi = {
  // 获取会员等级配置
  getMemberLevels: (): Promise<any> =>
    request<any>('/member/levels'),

  // 更新会员等级配置
  updateMemberLevels: (data: any): Promise<any> =>
    request<any>('/member/levels', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}; 