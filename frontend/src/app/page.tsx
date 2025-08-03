"use client"

import { Button } from "@/components/ui/button";
import { Plus, AppWindow, Users, Settings, Loader2, LogOut } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { CreateAppDialog } from "@/components/CreateAppDialog";
import { AppCard } from "@/components/AppCard";
import { toast } from "sonner";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const { applications, loading, error, createApplication, deleteApplication } = useApplications();
  const router = useRouter();

  const handleCreateApp = async (data: { name: string; description: string }) => {
    try {
      await createApplication(data);
      toast.success("应用创建成功！");
    } catch (error) {
      toast.error("创建应用失败，请重试");
      throw error;
    }
  };

  const handleDeleteApp = async (id: number) => {
    try {
      await deleteApplication(id);
      toast.success("应用删除成功！");
    } catch (error) {
      toast.error("删除应用失败，请重试");
      throw error;
    }
  };

  const handleReleaseVersion = async (appId: number, data: { version: string; changelogMd: string }) => {
    try {
      // 这里需要调用版本发布API
      toast.success("版本发布成功！");
    } catch (error) {
      toast.error("版本发布失败，请重试");
      throw error;
    }
  };

  const handleLogout = () => {
    authApi.logout();
    toast.success("已退出登录");
    router.push('/login');
  };

  if (loading) {
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
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-gray-600">加载中...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  重试
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边导航 */}
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
          <div className="mt-auto p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>退出登录</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">应用列表</h1>
            <div className="flex justify-between items-center mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索应用..."
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <CreateAppDialog onCreateApp={handleCreateApp} />
            </div>
          </header>

          {/* 应用网格列表 */}
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AppWindow className="h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium">暂无应用</h3>
              <p className="mt-1 text-sm text-gray-500">点击下方按钮创建第一个应用</p>
              <CreateAppDialog onCreateApp={handleCreateApp} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <AppCard 
                  key={app.id} 
                  app={app}
                  onDeleteApp={handleDeleteApp}
                  onReleaseVersion={handleReleaseVersion}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
