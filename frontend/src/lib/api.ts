import { Application, CreateApplicationRequest, CreateVersionRequest, Version } from '@/types/app';

// API基础配置 - 根据环境动态设置
const getApiBaseUrl = () => {
  // 在服务器端渲染时，使用环境变量或默认值
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  }
  // 在客户端时，使用环境变量或默认值
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// 获取JWT token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// 设置JWT token
function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

// 清除JWT token
function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuthToken();
        // 重定向到登录页面
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // 如果是网络错误，提供更详细的错误信息
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查服务器是否启动');
    }
    throw error;
  }
}

// 应用管理API
export const appApi = {
  getApplications: async (): Promise<Application[]> => {
    try {
      const response = await request<{code: number; data: Application[]; message: string}>('/apps');
      
      // 验证响应数据结构
      if (!response.data || !Array.isArray(response.data)) {
        console.error('API响应数据结构错误:', response);
        throw new Error('服务器返回的数据格式错误');
      }
      
      return response.data;
    } catch (error) {
      console.error('获取应用列表API错误:', error);
      throw error;
    }
  },

  createApplication: async (data: CreateApplicationRequest): Promise<Application> => {
    try {
      const response = await request<{code: number; data: Application; message: string}>('/apps', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.data) {
        throw new Error('创建应用响应数据无效');
      }
      
      return response.data;
    } catch (error) {
      console.error('创建应用API错误:', error);
      throw error;
    }
  },

  deleteApplication: async (id: number): Promise<void> => {
    try {
      await request<void>(`/apps/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('删除应用API错误:', error);
      throw error;
    }
  },

  getApplication: async (id: number): Promise<Application> => {
    try {
      const response = await request<{code: number; data: Application; message: string}>(`/apps/${id}`);
      
      if (!response.data) {
        throw new Error('获取应用详情响应数据无效');
      }
      
      return response.data;
    } catch (error) {
      console.error('获取应用详情API错误:', error);
      throw error;
    }
  },

  createVersion: async (appId: number, data: CreateVersionRequest): Promise<Version> => {
    try {
      const response = await request<{code: number; data: Version; message: string}>(`/apps/${appId}/versions`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.data) {
        throw new Error('创建版本响应数据无效');
      }
      
      return response.data;
    } catch (error) {
      console.error('创建版本API错误:', error);
      throw error;
    }
  },

  getVersions: async (appId: number): Promise<Version[]> => {
    try {
      const response = await request<{code: number; data: Version[]; message: string}>(`/apps/${appId}/versions`);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('获取版本列表响应数据无效');
      }
      
      return response.data;
    } catch (error) {
      console.error('获取版本列表API错误:', error);
      throw error;
    }
  },
};

// 系统初始化API
export const systemApi = {
  getInitStatus: (): Promise<{initialized: boolean; adminCount: number}> =>
    request<{code: number; data: {initialized: boolean; adminCount: number}; message: string}>('/system/init-status').then(res => res.data),

  initAdmin: (data: {username: string; email: string; password: string}): Promise<any> =>
    request<{code: number; data: any; message: string}>('/system/init-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data),
};

// 认证API
export const authApi = {
  login: async (username: string, password: string): Promise<{token: string; user: any}> => {
    try {
      const response = await request<{code: number; data: {token: string; user: any}; message: string}>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // 验证响应数据结构
      if (!response.data || !response.data.token) {
        throw new Error('登录响应数据无效');
      }
      
      // 保存token到localStorage
      setAuthToken(response.data.token);
      
      return response.data;
    } catch (error: any) {
      // 如果是网络错误或其他错误，重新抛出
      if (error.message.includes('HTTP error!')) {
        throw error;
      }
      // 如果是数据验证错误，抛出特定错误
      throw new Error(error.message || '登录失败');
    }
  },

  register: async (username: string, email: string, password: string): Promise<any> => {
    const response = await request<{code: number; data: any; message: string}>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    return response.data;
  },

  logout: (): void => {
    clearAuthToken();
  },

  isAuthenticated: (): boolean => {
    return getAuthToken() !== null;
  },
};

// 会员管理API
export const memberApi = {
  getMemberLevels: (): Promise<any> =>
    request<{code: number; data: {levels: any[]}; message: string}>('/member/levels').then(res => res.data.levels),

  updateMemberLevels: (levels: any[]): Promise<any[]> =>
    request<{code: number; data: any[]; message: string}>('/member/levels', {
      method: 'PUT',
      body: JSON.stringify({ levels }),
    }).then(res => res.data),
};

 