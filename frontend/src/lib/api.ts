import { Application, CreateApplicationRequest, CreateVersionRequest, Version } from '@/types/app';


// API基础配置
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/api/v1' 
  : '/api/v1';

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
}

// 应用管理API
export const appApi = {
  getApplications: (): Promise<Application[]> =>
    request<{code: number; data: Application[]; message: string}>('/apps').then(res => res.data),

  createApplication: (data: CreateApplicationRequest): Promise<Application> =>
    request<{code: number; data: Application; message: string}>('/apps', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data),

  deleteApplication: (id: number): Promise<void> =>
    request<void>(`/apps/${id}`, { method: 'DELETE' }),

  getApplication: (id: number): Promise<Application> =>
    request<{code: number; data: Application; message: string}>(`/apps/${id}`).then(res => res.data),

  createVersion: (appId: number, data: CreateVersionRequest): Promise<Version> =>
    request<{code: number; data: Version; message: string}>(`/apps/${appId}/versions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data),

  getVersions: (appId: number): Promise<Version[]> =>
    request<{code: number; data: Version[]; message: string}>(`/apps/${appId}/versions`).then(res => res.data),
};

// 认证API
export const authApi = {
  login: async (username: string, password: string): Promise<{token: string; user: any}> => {
    const response = await request<{code: number; data: {token: string; user: any}; message: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.data.token) {
      setAuthToken(response.data.token);
    }
    
    return response.data;
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

 