"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('请输入用户名和密码');
      return;
    }

    try {
      setLoading(true);
      
      // 调用登录API
      const result = await authApi.login(username, password);
      
      // 验证登录结果
      if (!result || !result.token) {
        throw new Error('登录响应数据无效');
      }
      
      toast.success('登录成功！');
      
      // 等待一下确保token已保存到localStorage
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 验证token是否已保存
      if (!authApi.isAuthenticated()) {
        throw new Error('登录状态保存失败');
      }
      
      // 跳转到主页
      router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // 根据错误类型显示不同的错误信息
      if (error.message === '登录响应数据无效') {
        toast.error('登录响应数据无效，请重试');
      } else if (error.message === '登录状态保存失败') {
        toast.error('登录状态保存失败，请重试');
      } else if (error.message.includes('401')) {
        toast.error('用户名或密码错误');
      } else if (error.message.includes('HTTP error! status: 500')) {
        toast.error('服务器错误，请稍后重试');
      } else if (error.message.includes('网络连接失败')) {
        toast.error('网络连接失败，请检查服务器是否启动');
      } else {
        toast.error('登录失败，请检查网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">版本管理系统</CardTitle>
          <CardDescription className="text-center">
            请登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>请输入管理员账号和密码</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 