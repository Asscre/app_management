"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, GitCompare, Calendar, User, Tag } from "lucide-react";
import { Version } from "@/types/app";

interface VersionHistoryDialogProps {
  appId: number;
  appName: string;
  versions: Version[];
  trigger?: React.ReactNode;
}

interface VersionDiff {
  added: string[];
  removed: string[];
  changed: string[];
}

export function VersionHistoryDialog({ appId, appName, versions, trigger }: VersionHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersion1, setSelectedVersion1] = useState<string>('');
  const [selectedVersion2, setSelectedVersion2] = useState<string>('');
  const [diffResult, setDiffResult] = useState<VersionDiff | null>(null);

  // 自动选择最新的两个版本进行对比
  useEffect(() => {
    if (versions.length >= 2) {
      setSelectedVersion1(versions[0].version);
      setSelectedVersion2(versions[1].version);
    } else if (versions.length === 1) {
      setSelectedVersion1(versions[0].version);
      setSelectedVersion2('');
    }
  }, [versions]);

  const compareVersions = () => {
    if (!selectedVersion1 || !selectedVersion2) return;

    const version1 = versions.find(v => v.version === selectedVersion1);
    const version2 = versions.find(v => v.version === selectedVersion2);

    if (!version1 || !version2) return;

    // 简单的文本差异对比
    const text1 = version1.changelogMd || '';
    const text2 = version2.changelogMd || '';

    const lines1 = text1.split('\n').filter(line => line.trim());
    const lines2 = text2.split('\n').filter(line => line.trim());

    const added = lines2.filter(line => !lines1.includes(line));
    const removed = lines1.filter(line => !lines2.includes(line));
    const changed = lines1.filter(line => {
      const similarLine = lines2.find(l => l.includes(line.split(' ')[0]));
      return similarLine && similarLine !== line;
    });

    setDiffResult({ added, removed, changed });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getVersionBadgeColor = (version: string) => {
    const [major, minor, patch] = version.split('.').map(Number);
    if (major > 0) return 'bg-red-100 text-red-800';
    if (minor > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const renderChangelog = (changelog: string) => {
    return changelog.split('\n').map((line, index) => {
      if (line.startsWith('##')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('##', '').trim()}</h3>;
      }
      if (line.startsWith('#')) {
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3">{line.replace('#', '').trim()}</h2>;
      }
      if (line.startsWith('-') || line.startsWith('*')) {
        return <li key={index} className="ml-4">{line.replace(/^[-*]\s*/, '')}</li>;
      }
      if (line.trim()) {
        return <p key={index} className="mb-2">{line}</p>;
      }
      return <br key={index} />;
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            版本历史
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            版本历史 - {appName}
          </DialogTitle>
          <DialogDescription>
            查看应用版本变更历史和差异对比
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 版本对比选择器 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-4 w-4" />
                版本对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">版本 A</label>
                  <Select value={selectedVersion1} onValueChange={setSelectedVersion1}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择版本" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version.version} value={version.version}>
                          <div className="flex items-center gap-2">
                            <Badge className={getVersionBadgeColor(version.version)}>
                              {version.version}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(version.createdAt)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">版本 B</label>
                  <Select value={selectedVersion2} onValueChange={setSelectedVersion2}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择版本" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version.version} value={version.version}>
                          <div className="flex items-center gap-2">
                            <Badge className={getVersionBadgeColor(version.version)}>
                              {version.version}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(version.createdAt)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={compareVersions} 
                className="mt-4"
                disabled={!selectedVersion1 || !selectedVersion2}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                对比版本
              </Button>
            </CardContent>
          </Card>

          {/* 差异对比结果 */}
          {diffResult && (
            <Card>
              <CardHeader>
                <CardTitle>差异对比结果</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {diffResult.added.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">新增内容:</h4>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        {diffResult.added.map((line, index) => (
                          <div key={index} className="text-green-800">+ {line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {diffResult.removed.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">删除内容:</h4>
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        {diffResult.removed.map((line, index) => (
                          <div key={index} className="text-red-800">- {line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {diffResult.changed.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">修改内容:</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        {diffResult.changed.map((line, index) => (
                          <div key={index} className="text-yellow-800">~ {line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 版本历史列表 */}
          <Card>
            <CardHeader>
              <CardTitle>版本历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getVersionBadgeColor(version.version)}>
                          <Tag className="h-3 w-3 mr-1" />
                          {version.version}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="text-green-600">
                            最新版本
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(version.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      {renderChangelog(version.changelogMd)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
