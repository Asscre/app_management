"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { systemApi, authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { AppCard } from "@/components/AppCard";
import { CreateAppDialog } from "@/components/CreateAppDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { LogOut, AppWindow, Users, Settings } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        if (!isMounted) return;
        
        setHasError(false);
        
        // 第一步：检查是否已登录
        const authenticated = authApi.isAuthenticated();
        if (!isMounted) return;
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          // 已登录，直接进入应用管理界面
          if (!isMounted) return;
          setCheckingStatus(false);
          return;
        }
        
        // 第二步：未登录，检查系统是否已初始化
        const status = await systemApi.getInitStatus();
        if (!isMounted) return;
        setIsInitialized(status.initialized);
        
        if (!status.initialized) {
          // 未初始化，跳转到初始化页面
          router.replace("/init");
          return;
        } else {
          // 已初始化但未登录，跳转到登录页面
          router.replace("/login");
          return;
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error("检查系统状态失败:", error);
        
        // 如果是网络错误，可能是后端服务未启动
        if (error instanceof Error && error.message.includes('HTTP error! status: 0')) {
          toast.error("无法连接到服务器，请检查后端服务是否启动");
        } else if (error instanceof Error && error.message.includes('网络连接失败')) {
          toast.error("网络连接失败，请检查服务器是否启动");
        } else {
          toast.error("检查系统状态失败");
        }
        
        setHasError(true);
        setCheckingStatus(false);
      }
    };
    
    // 添加延迟确保状态检查不会太快
    const timer = setTimeout(() => {
      checkStatus();
    }, 200);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [router]);

  // 只在已登录时加载业务数据
  const shouldLoadApplications = !checkingStatus && !hasError && isAuthenticated === true;
  const { applications, loading, error, createApplication, deleteApplication } = useApplications(shouldLoadApplications);

  // 检查状态时显示加载界面
  if (checkingStatus) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-gray-600">检查系统状态...</span>
      </div>
    );
  }

  // 发生错误时显示错误界面
  if (hasError) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">系统状态检查失败</p>
          <Button onClick={() => window.location.reload()}>重试</Button>
        </div>
      </div>
    );
  }

  // 未登录或未初始化时不渲染业务内容
  if (isAuthenticated !== true) {
    return null;
  }

  // 已登录，显示应用管理界面
  return (
    <div className="flex h-screen bg-gray-50">
      <nav className="w-64 border-r bg-white">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">版本管理系统</h1>
        </div>
        <div className="p-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
            <AppWindow className="h-5 w-5" />
            <span className="font-medium">应用管理</span>
          </div>
          <Link href="/member" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Users className="h-5 w-5" />
            <span>会员管理</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Settings className="h-5 w-5" />
            <span>系统设置</span>
          </Link>
        </div>
      </nav>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">应用列表</h1>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-4">
                <CreateAppDialog onCreateApp={async (data) => { await createApplication(data); }} />
              </div>
              <Button onClick={() => {authApi.logout();router.push('/login')}} variant="outline" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                退出登录
              </Button>
            </div>
          </header>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          ) : !Array.isArray(applications) || applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <h3 className="mt-2 text-sm font-medium">暂无应用</h3>
              <p className="mt-1 text-sm text-gray-500">点击上方按钮创建第一个应用</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onDeleteApp={deleteApplication}
                  onReleaseVersion={async () => {}}
                  versions={app.versions || []}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
