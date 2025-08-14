"use client"

import { useState, useEffect } from 'react';
import { Application, CreateApplicationRequest } from '@/types/app';
import { appApi } from '@/lib/api';

export function useApplications(enabled: boolean = true) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取应用列表
  const fetchApplications = async () => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await appApi.getApplications();
      
      // 验证返回的数据是否为数组
      if (!Array.isArray(data)) {
        console.error('API返回的数据不是数组:', data);
        throw new Error('服务器返回的数据格式错误');
      }
      
      setApplications(data);
    } catch (err) {
      console.error('获取应用列表失败:', err);
      setError(err instanceof Error ? err.message : '获取应用列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建应用
  const createApplication = async (data: CreateApplicationRequest) => {
    try {
      const newApp = await appApi.createApplication(data);
      setApplications(prev => [...prev, newApp]);
      return newApp;
    } catch (err) {
      console.error('创建应用失败:', err);
      throw err;
    }
  };

  // 删除应用
  const deleteApplication = async (id: number) => {
    try {
      await appApi.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('删除应用失败:', err);
      throw err;
    }
  };

  // 只有在enabled为true时才初始化加载
  useEffect(() => {
    if (enabled) {
      fetchApplications();
    }
  }, [enabled]);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    deleteApplication,
  };
} 