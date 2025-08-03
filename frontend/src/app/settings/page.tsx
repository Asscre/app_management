"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Users, Settings, Shield, Activity, Database, Bell } from "lucide-react";
import { AuditLog } from "@/components/AuditLog";
import Link from "next/link";
import { toast } from "sonner";
import AuthGuard from "@/components/AuthGuard";

// 模拟操作日志数据
const mockAuditLogs = [
  {
    id: "1",
    userId: "admin",
    userName: "系统管理员",
    action: "create",
    entityType: "application",
    entityId: "1",
    entityName: "移动端APP",
    details: { name: "移动端APP", description: "企业移动应用" },
    ipAddress: "192.168.1.100",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    status: "success" as const
  },
  {
    id: "2",
    userId: "admin",
    userName: "系统管理员",
    action: "update",
    entityType: "member_levels",
    entityId: "levels",
    entityName: "会员等级配置",
    details: { levels: 4, updatedFields: ["permissions"] },
    ipAddress: "192.168.1.100",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    status: "success" as const
  },
  {
    id: "3",
    userId: "user1",
    userName: "张三",
    action: "login",
    entityType: "user",
    entityId: "user1",
    entityName: "",
    details: { userAgent: "Chrome/120.0.0.0" },
    ipAddress: "192.168.1.101",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4小时前
    status: "success" as const
  },
  {
    id: "4",
    userId: "user2",
    userName: "李四",
    action: "delete",
    entityType: "application",
    entityId: "2",
    entityName: "测试应用",
    details: { reason: "项目终止" },
    ipAddress: "192.168.1.102",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    status: "success" as const
  },
  {
    id: "5",
    userId: "user3",
    userName: "王五",
    action: "login",
    entityType: "user",
    entityId: "user3",
    entityName: "",
    details: { userAgent: "Firefox/120.0" },
    ipAddress: "192.168.1.103",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2天前
    status: "failed" as const
  }
];

export default function SettingsPage() {
  const [logs, setLogs] = useState(mockAuditLogs);
  const [loading, setLoading] = useState(false);

  const handleRefreshLogs = async () => {
    setLoading(true);
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLogs([...mockAuditLogs]);
    setLoading(false);
    toast.success("日志已刷新");
  };

  const handleExportLogs = () => {
    const csvContent = [
      "时间,用户,操作,目标,IP地址,状态",
      ...logs.map(log => 
        `${new Date(log.timestamp).toLocaleString()},${log.userName},${log.action},${log.entityName || 'N/A'},${log.ipAddress},${log.status}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("日志已导出");
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        <nav className="w-64 border-r bg-white">
          <div className="p-4 border-b">
            <h1 className="text-xl font-semibold">版本管理系统</h1>
          </div>
          <div className="p-2">
            <Link href="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <AppWindow className="h-5 w-5" />
              <span>应用管理</span>
            </Link>
            <Link href="/member" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <Users className="h-5 w-5" />
              <span>会员管理</span>
            </Link>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
              <Settings className="h-5 w-5" />
              <span className="font-medium">系统设置</span>
            </div>
          </div>
        </nav>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold">系统设置</h1>
              <p className="text-gray-600">系统配置和监控信息</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 系统状态卡片 */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      系统安全
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">认证状态</span>
                        <Badge className="bg-green-100 text-green-800">正常</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">API密钥</span>
                        <Badge className="bg-green-100 text-green-800">已启用</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">访问控制</span>
                        <Badge className="bg-green-100 text-green-800">已启用</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      性能监控
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">响应时间</span>
                        <Badge variant="outline">120ms</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">并发连接</span>
                        <Badge variant="outline">45</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">缓存命中率</span>
                        <Badge variant="outline">95%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      数据统计
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">应用数量</span>
                        <Badge variant="outline">12</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">版本总数</span>
                        <Badge variant="outline">156</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">会员等级</span>
                        <Badge variant="outline">4</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 审计日志 */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="h-5 w-5" />
                          审计日志
                        </CardTitle>
                        <CardDescription>
                          系统操作记录和访问日志
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRefreshLogs}
                          disabled={loading}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          {loading ? '刷新中...' : '刷新'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleExportLogs}
                        >
                          <Database className="h-4 w-4 mr-2" />
                          导出
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AuditLog logs={logs} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 