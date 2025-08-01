"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateApplicationRequest } from "@/types/app";

const createAppSchema = z.object({
  name: z.string()
    .min(2, "应用名称至少2个字符")
    .max(20, "应用名称最多20个字符")
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, "应用名称只能包含字母、数字、中文、下划线和连字符"),
  description: z.string()
    .max(200, "描述最多200个字符")
    .optional(),
});

interface CreateAppDialogProps {
  onCreateApp: (data: CreateApplicationRequest) => Promise<void>;
}

export function CreateAppDialog({ onCreateApp }: CreateAppDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof createAppSchema>>({
    resolver: zodResolver(createAppSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof createAppSchema>) => {
    try {
      setLoading(true);
      await onCreateApp(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('创建应用失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          新增应用
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增应用</DialogTitle>
          <DialogDescription>
            创建一个新的应用，用于版本管理和发布。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>应用名称 *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="输入2-20个字符的应用名称" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>应用描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="输入应用描述（可选，最多200字符）" 
                      className="h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                创建应用
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 