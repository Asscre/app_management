"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { systemApi, authApi } from "@/lib/api";
import { Loader2, Activity, Database, Trash2, RefreshCw, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuditLog } from "@/components/AuditLog";
import { toast } from "sonner";

interface PerformanceStats {
  requestCount: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  errorCount: number;
  successCount: number;
}

interface CacheStats {
  hitRate: number;
  totalKeys: number;
  memoryUsage: string;
  lastClearTime: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [systemLoading, setSystemLoading] = useState(true);
  const [needsInit, setNeedsInit] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // 审计日志状态
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // 性能监控状态
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  
  // 缓存管理状态
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const status = await systemApi.getInitStatus();
        setNeedsInit(!status.initialized);
        if (!status.initialized) {
          router.replace("/init");
          return;
        }
        const authenticated = authApi.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (!authenticated) {
          router.replace("/login");
          return;
        }
        setSystemLoading(false);
      } catch (error) {
        toast.error("检查系统状态失败");
        setSystemLoading(false);
      }
    };
    checkSystemStatus();
  }, [router]);

  const loadAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await fetch('/api/v1/system/audit-logs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setAuditLogs(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("加载审计日志失败");
    } finally {
      setLogsLoading(false);
    }
  };

  const loadPerformanceStats = async () => {
    try {
      setPerformanceLoading(true);
      const response = await fetch('/api/v1/system/performance/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setPerformanceStats(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("加载性能统计失败");
    } finally {
      setPerformanceLoading(false);
    }
  };

  const loadCacheStats = async () => {
    try {
      setCacheLoading(true);
      const response = await fetch('/api/v1/system/cache/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        setCacheStats(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("加载缓存统计失败");
    } finally {
      setCacheLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/v1/system/cache/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        toast.success("缓存清除成功");
        loadCacheStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("清除缓存失败");
    }
  };

  const resetPerformanceStats = async () => {
    try {
      const response = await fetch('/api/v1/system/performance/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.code === 200) {
        toast.success("性能统计已重置");
        loadPerformanceStats();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error("重置性能统计失败");
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['时间', '用户', '操作', '实体类型', '实体名称', 'IP地址', '状态'],
      ...auditLogs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.userName,
        log.action,
        log.entityType || '',
        log.entityName || '',
        log.ipAddress,
        log.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 初始化加载数据
  useEffect(() => {
    if (!systemLoading && !needsInit && isAuthenticated) {
      loadAuditLogs();
      loadPerformanceStats();
      loadCacheStats();
    }
  }, [systemLoading, needsInit, isAuthenticated]);

  if (systemLoading || needsInit === null || isAuthenticated === null) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-gray-600">检查系统状态...</span>
      </div>
    );
  }
  if (needsInit) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-gray-600 mt-1">管理系统配置、监控性能和查看审计日志</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 性能监控卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">性能监控</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {performanceLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : performanceStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">总请求数</span>
                  <span className="text-sm font-medium">{performanceStats.requestCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">平均延迟</span>
                  <span className="text-sm font-medium">{performanceStats.averageLatency.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">错误率</span>
                  <span className="text-sm font-medium">
                    {performanceStats.requestCount > 0 
                      ? ((performanceStats.errorCount / performanceStats.requestCount) * 100).toFixed(2)
                      : 0}%
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={resetPerformanceStats}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重置统计
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 缓存管理卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">缓存管理</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {cacheLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : cacheStats ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">命中率</span>
                  <span className="text-sm font-medium">{cacheStats.hitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">缓存键数</span>
                  <span className="text-sm font-medium">{cacheStats.totalKeys.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">内存使用</span>
                  <span className="text-sm font-medium">{cacheStats.memoryUsage}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={clearCache}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清除缓存
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">暂无数据</p>
            )}
          </CardContent>
        </Card>

        {/* 系统状态卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">数据库</span>
                <Badge variant="outline" className="text-green-600">正常</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Redis</span>
                <Badge variant="outline" className="text-green-600">正常</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API服务</span>
                <Badge variant="outline" className="text-green-600">正常</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 审计日志 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>审计日志</CardTitle>
              <CardDescription>查看系统操作历史记录</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadAuditLogs} disabled={logsLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" onClick={exportAuditLogs} disabled={auditLogs.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-gray-600">加载审计日志...</span>
            </div>
          ) : (
            <AuditLog 
              logs={auditLogs}
              onRefresh={loadAuditLogs}
              onExport={exportAuditLogs}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 