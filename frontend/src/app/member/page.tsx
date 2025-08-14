"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { systemApi, authApi } from "@/lib/api";
import { Loader2, Plus, Save, RefreshCw } from "lucide-react";
import { useMemberLevels } from "@/hooks/useMemberLevels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JSONEditor } from "@/components/JSONEditor";
import { toast } from "sonner";

// 默认会员等级配置
const defaultMemberLevels = [
  {
    name: '普通会员',
    level: 1,
    permissions: JSON.stringify({
      features: ['basic'],
      limits: {
        api_calls: 1000,
        storage: '1GB'
      },
      restrictions: []
    }, null, 2)
  },
  {
    name: '高级会员',
    level: 2,
    permissions: JSON.stringify({
      features: ['basic', 'advanced'],
      limits: {
        api_calls: 5000,
        storage: '5GB'
      },
      restrictions: []
    }, null, 2)
  },
  {
    name: '企业会员',
    level: 3,
    permissions: JSON.stringify({
      features: ['basic', 'advanced', 'enterprise'],
      limits: {
        api_calls: 50000,
        storage: '50GB'
      },
      restrictions: []
    }, null, 2)
  }
];

export default function MemberPage() {
  const router = useRouter();
  const [systemLoading, setSystemLoading] = useState(true);
  const [needsInit, setNeedsInit] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [memberLevels, setMemberLevels] = useState(defaultMemberLevels);
  const [saving, setSaving] = useState(false);

  const { loading, error, updateMemberLevels } = useMemberLevels();

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

  const handleAddLevel = () => {
    const newLevel = {
      name: `新会员等级${memberLevels.length + 1}`,
      level: memberLevels.length + 1,
      permissions: JSON.stringify({
        features: ['basic'],
        limits: {
          api_calls: 1000,
          storage: '1GB'
        },
        restrictions: []
      }, null, 2)
    };
    setMemberLevels([...memberLevels, newLevel]);
  };

  const handleDeleteLevel = (index: number) => {
    const newLevels = memberLevels.filter((_, i) => i !== index);
    // 重新调整等级
    const adjustedLevels = newLevels.map((level, i) => ({
      ...level,
      level: i + 1
    }));
    setMemberLevels(adjustedLevels);
  };

  const handleUpdateLevel = (index: number, field: string, value: string | number) => {
    const newLevels = [...memberLevels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setMemberLevels(newLevels);
  };

  const handleSaveLevels = async () => {
    try {
      setSaving(true);
      await updateMemberLevels(memberLevels);
      toast.success("会员等级配置保存成功");
      setEditingLevel(null);
    } catch (error) {
      toast.error("保存失败，请检查JSON格式");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setMemberLevels(defaultMemberLevels);
    toast.info("已重置为默认配置");
  };

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">会员管理</h1>
          <p className="text-gray-600 mt-1">配置会员等级和权限策略</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetToDefault}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置默认
          </Button>
          <Button onClick={handleAddLevel}>
            <Plus className="h-4 w-4 mr-2" />
            添加等级
          </Button>
          <Button onClick={handleSaveLevels} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            保存配置
          </Button>
        </div>
      </div>

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
      ) : (
        <div className="grid gap-6">
          {memberLevels.map((level, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="text"
                        value={level.name}
                        onChange={(e) => handleUpdateLevel(index, 'name', e.target.value)}
                        className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        placeholder="会员等级名称"
                      />
                      <Badge variant="outline">等级 {level.level}</Badge>
                    </div>
                    <CardDescription>
                      配置该等级会员的权限和限制
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLevel(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    删除
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      权限配置 (JSON)
                    </label>
                    <JSONEditor
                      value={level.permissions}
                      onChange={(value) => handleUpdateLevel(index, 'permissions', value)}
                      height="300px"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">功能特性</h4>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          try {
                            const perms = JSON.parse(level.permissions);
                            return perms.features?.join(', ') || '无';
                          } catch {
                            return '格式错误';
                          }
                        })()}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">API调用限制</h4>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          try {
                            const perms = JSON.parse(level.permissions);
                            return perms.limits?.api_calls?.toLocaleString() || '无限制';
                          } catch {
                            return '格式错误';
                          }
                        })()} 次/月
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">存储限制</h4>
                      <div className="text-sm text-gray-600">
                        {(() => {
                          try {
                            const perms = JSON.parse(level.permissions);
                            return perms.limits?.storage || '无限制';
                          } catch {
                            return '格式错误';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">权限配置说明</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>features</strong>: 可用功能列表，如 [&apos;basic&apos;, &apos;advanced&apos;, &apos;enterprise&apos;]</p>
          <p>• <strong>limits.api_calls</strong>: 每月API调用次数限制</p>
          <p>• <strong>limits.storage</strong>: 存储空间限制</p>
          <p>• <strong>restrictions</strong>: 功能限制列表</p>
        </div>
      </div>
    </div>
  );
} 