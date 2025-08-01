import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Users, Settings, Save, RotateCcw, Eye } from "lucide-react";
import { useMemberLevels } from "@/hooks/useMemberLevels";
import { JSONEditor } from "@/components/JSONEditor";
import { toast } from "sonner";
import Link from "next/link";

export default function MemberPage() {
  const { memberLevels, loading, error, updateMemberLevels } = useMemberLevels();
  const [isEditing, setIsEditing] = useState(false);
  const [jsonContent, setJsonContent] = useState('');

  const handleSave = async () => {
    try {
      await updateMemberLevels(JSON.parse(jsonContent));
      setIsEditing(false);
      toast.success("会员权限配置保存成功！");
    } catch (error) {
      toast.error("保存失败，请检查JSON格式");
    }
  };

  const handleReset = () => {
    setJsonContent(JSON.stringify(memberLevels, null, 2));
    setIsEditing(false);
  };

  if (loading) {
    return (
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
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">会员管理</span>
            </div>
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
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
            <Link href="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
              <AppWindow className="h-5 w-5" />
              <span>应用管理</span>
            </Link>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
              <Users className="h-5 w-5" />
              <span className="font-medium">会员管理</span>
            </div>
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
          <Link href="/" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <AppWindow className="h-5 w-5" />
            <span>应用管理</span>
          </Link>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 text-blue-700">
            <Users className="h-5 w-5" />
            <span className="font-medium">会员管理</span>
          </div>
          <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50">
            <Settings className="h-5 w-5" />
            <span>系统设置</span>
          </Link>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">会员权限管理</h1>
            <p className="text-gray-600 mt-2">配置不同会员等级的权限和权益</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 权限配置编辑器 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>权限配置</CardTitle>
                      <CardDescription>
                        编辑会员等级权限JSON配置
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {!isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setJsonContent(JSON.stringify(memberLevels, null, 2));
                            setIsEditing(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          编辑
                        </Button>
                      )}
                      {isEditing && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleReset}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            重置
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleSave}
                          >
                            <Save className="h-4 w-4 mr-2" />
                            保存
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <JSONEditor
                    value={isEditing ? jsonContent : JSON.stringify(memberLevels, null, 2)}
                    onChange={setJsonContent}
                    readOnly={!isEditing}
                    height="600px"
                  />
                </CardContent>
              </Card>
            </div>

            {/* 权限预览 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">会员等级</CardTitle>
                  <CardDescription>当前配置的会员等级</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {memberLevels?.levels?.map((level: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{level.name}</span>
                        <Badge variant="outline">{level.level}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">权限说明</CardTitle>
                  <CardDescription>JSON配置格式说明</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>• <code>levels</code>: 会员等级数组</p>
                    <p>• <code>name</code>: 等级名称</p>
                    <p>• <code>level</code>: 等级数值</p>
                    <p>• <code>permissions</code>: 权限列表</p>
                    <p>• <code>benefits</code>: 权益列表</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 