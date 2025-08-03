"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Users, Settings, Save, RotateCcw, Eye } from "lucide-react";
import { useMemberLevels } from "@/hooks/useMemberLevels";
import { JSONEditor } from "@/components/JSONEditor";
import { toast } from "sonner";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

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
            <header className="mb-6">
              <h1 className="text-2xl font-bold">会员等级管理</h1>
              <p className="text-gray-600">配置不同等级的会员权限和功能</p>
            </header>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">加载中...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    重试
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      会员等级配置
                    </CardTitle>
                    <CardDescription>
                      编辑会员等级的权限配置，支持JSON格式
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">JSON编辑器</Badge>
                          {isEditing && (
                            <Badge variant="secondary">编辑模式</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <Button onClick={() => {
                              setJsonContent(JSON.stringify(memberLevels, null, 2));
                              setIsEditing(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              编辑配置
                            </Button>
                          ) : (
                            <>
                              <Button onClick={handleSave} variant="default">
                                <Save className="h-4 w-4 mr-2" />
                                保存
                              </Button>
                              <Button onClick={handleReset} variant="outline">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                重置
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <JSONEditor
                          value={jsonContent}
                          onChange={setJsonContent}
                          height="400px"
                        />
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-600 text-sm">
                            点击"编辑配置"按钮开始编辑会员等级配置
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>当前配置预览</CardTitle>
                    <CardDescription>
                      当前生效的会员等级配置
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {memberLevels.map((level) => (
                        <div key={level.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{level.name}</h4>
                            <p className="text-sm text-gray-600">等级 {level.level}</p>
                          </div>
                          <Badge variant="outline">
                            {level.permissions ? '已配置' : '未配置'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 