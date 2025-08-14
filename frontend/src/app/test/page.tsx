"use client"

import { useState, useEffect } from 'react';
import { systemApi } from '@/lib/api';

export default function TestPage() {
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        const result = await systemApi.getInitStatus();
        setStatus(result);
      } catch (err: any) {
        setError(err.message);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API测试页面</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>错误:</strong> {error}
        </div>
      )}
      
      {status && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>成功:</strong> {JSON.stringify(status)}
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">API配置信息:</h2>
        <p>NODE_ENV: {process.env.NODE_ENV}</p>
        <p>API_BASE_URL: {process.env.NODE_ENV === 'development' 
          ? (typeof window !== 'undefined' ? 'http://localhost:8080/api/v1' : 'http://backend:8080/api/v1')
          : '/api/v1'}</p>
      </div>
    </div>
  );
} 