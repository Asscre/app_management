import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateVersionRequest } from "@/types/app";

const releaseVersionSchema = z.object({
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, "版本号格式应为 x.y.z，如 1.2.3"),
  changelogMd: z.string()
    .min(1, "更新日志不能为空")
    .max(5000, "更新日志最多5000字符"),
});

interface ReleaseVersionDialogProps {
  appId: number;
  appName: string;
  currentVersion: string;
  onReleaseVersion: (appId: number, data: CreateVersionRequest) => Promise<void>;
}

export function ReleaseVersionDialog({ appId, appName, currentVersion, onReleaseVersion }: ReleaseVersionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<z.infer<typeof releaseVersionSchema>>({
    resolver: zodResolver(releaseVersionSchema),
    defaultValues: {
      version: "",
      changelogMd: "",
    },
  });

  const version = form.watch("version");
  const changelogMd = form.watch("changelogMd");

  // 验证版本号格式
  const isValidVersion = /^\d+\.\d+\.\d+$/.test(version);
  
  // 比较版本号
  const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
  };

  const isVersionHigher = isValidVersion && compareVersions(version, currentVersion) > 0;
  const isVersionLower = isValidVersion && compareVersions(version, currentVersion) < 0;

  const onSubmit = async (data: z.infer<typeof releaseVersionSchema>) => {
    try {
      setLoading(true);
      await onReleaseVersion(appId, data);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('发布版本失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setPreviewMode(false);
    }
    setOpen(newOpen);
  };

  // 简单的Markdown转HTML
  const markdownToHtml = (md: string) => {
    return md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          发布版本
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>发布新版本 - {appName}</DialogTitle>
          <DialogDescription>
            为应用 {appName} 发布新版本，当前版本为 v{currentVersion}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>版本号 *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="1.2.3" 
                        {...field} 
                        className="flex-1"
                      />
                      {isValidVersion && (
                        <div className="flex items-center gap-1">
                          {isVersionHigher ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              升级
                            </Badge>
                          ) : isVersionLower ? (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              降级
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              相同
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>更新日志</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? '编辑' : '预览'}
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="changelogMd"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      {previewMode ? (
                        <div className="border rounded-md p-4 bg-gray-50 min-h-[200px]">
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: markdownToHtml(changelogMd || '暂无内容') 
                            }}
                          />
                        </div>
                      ) : (
                        <Textarea 
                          placeholder="## 新功能&#10;- 功能1&#10;- 功能2&#10;&#10;## 修复&#10;- 修复问题1&#10;- 修复问题2" 
                          className="min-h-[200px] font-mono text-sm"
                          {...field} 
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading || !isValidVersion || isVersionLower}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                发布版本
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 