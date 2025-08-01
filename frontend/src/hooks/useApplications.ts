import { useState, useEffect } from 'react';
import { Application, CreateApplicationRequest } from '@/types/app';
import { appApi } from '@/lib/api';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取应用列表
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appApi.getApplications();
      setApplications(data);
    } catch (err) {
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
      throw err;
    }
  };

  // 删除应用
  const deleteApplication = async (id: number) => {
    try {
      await appApi.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      throw err;
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    deleteApplication,
  };
} 