"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, systemApi } from '@/lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [needsInit, setNeedsInit] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // 首先检查系统是否需要初始化
        const status = await systemApi.getInitStatus();
        setNeedsInit(!status.initialized);
        
        if (!status.initialized) {
          // 系统未初始化，跳转到初始化页面
          router.push('/init');
          return;
        }

        // 系统已初始化，检查用户认证状态
        const authenticated = authApi.isAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          router.push('/login');
        }
      } catch (error) {
        console.error('检查系统状态失败:', error);
        // 如果检查失败，假设需要初始化
        setNeedsInit(true);
        router.push('/init');
      }
    };

    checkSystemStatus();
  }, [router]);

  // 显示加载状态
  if (isAuthenticated === null || needsInit === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">检查系统状态...</p>
        </div>
      </div>
    );
  }

  // 如果系统需要初始化，不渲染内容（会重定向到初始化页）
  if (needsInit) {
    return null;
  }

  // 如果未认证，不渲染内容（会重定向到登录页）
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 