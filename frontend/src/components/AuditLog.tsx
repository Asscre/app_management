import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Activity, Search, Filter, Download } from "lucide-react";

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  details: any;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

interface AuditLogProps {
  logs: AuditLogEntry[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

const actionIcons = {
  create: <Activity className="h-4 w-4 text-green-600" />,
  update: <Activity className="h-4 w-4 text-blue-600" />,
  delete: <Activity className="h-4 w-4 text-red-600" />,
  login: <User className="h-4 w-4 text-purple-600" />,
  logout: <User className="h-4 w-4 text-gray-600" />,
  default: <Activity className="h-4 w-4 text-gray-600" />
};

const statusColors = {
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

const statusText = {
  success: '成功',
  failed: '失败',
  pending: '进行中'
};

export function AuditLog({ logs, loading = false, onRefresh, onExport }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entityName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = !filterAction || log.action === filterAction;
    const matchesStatus = !filterStatus || log.status === filterStatus;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getActionIcon = (action: string) => {
    const actionKey = action.toLowerCase() as keyof typeof actionIcons;
    return actionIcons[actionKey] || actionIcons.default;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now.getTime() - logTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return formatTimestamp(timestamp);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>操作日志</CardTitle>
            <CardDescription>系统操作记录和审计信息</CardDescription>
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <Clock className="h-4 w-4 mr-2" />
                刷新
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 搜索和过滤 */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索用户、操作或实体..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="操作类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部操作</SelectItem>
              <SelectItem value="create">创建</SelectItem>
              <SelectItem value="update">更新</SelectItem>
              <SelectItem value="delete">删除</SelectItem>
              <SelectItem value="login">登录</SelectItem>
              <SelectItem value="logout">登出</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value="success">成功</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="pending">进行中</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 日志列表 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无操作日志
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{log.userName}</span>
                      <span className="text-gray-500">执行了</span>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-gray-500">操作</span>
                      {log.entityName && (
                        <>
                          <span className="text-gray-500">，目标：</span>
                          <span className="font-medium">{log.entityName}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(log.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.userId}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {log.ipAddress}
                      </div>
                    </div>
                    {log.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                        {JSON.stringify(log.details, null, 2)}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Badge className={statusColors[log.status]}>
                      {statusText[log.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 