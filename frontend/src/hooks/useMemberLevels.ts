import { useState, useEffect } from 'react';
import { memberApi } from '@/lib/api';

export function useMemberLevels() {
  const [memberLevels, setMemberLevels] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取会员等级配置
  const fetchMemberLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberApi.getMemberLevels();
      setMemberLevels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取会员等级配置失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新会员等级配置
  const updateMemberLevels = async (data: any) => {
    try {
      const updatedData = await memberApi.updateMemberLevels(data);
      setMemberLevels(updatedData);
      return updatedData;
    } catch (err) {
      throw err;
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchMemberLevels();
  }, []);

  return {
    memberLevels,
    loading,
    error,
    fetchMemberLevels,
    updateMemberLevels,
  };
} 