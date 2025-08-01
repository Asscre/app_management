"use client"

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  requireConfirmation?: boolean;
  confirmationText?: string;
  onConfirm: () => Promise<void> | void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  danger = false,
  requireConfirmation = false,
  confirmationText = "请输入确认文本",
  onConfirm,
  trigger,
  children
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleConfirm = async () => {
    if (requireConfirmation && confirmation !== confirmationText) {
      return;
    }

    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
      setConfirmation('');
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmation('');
      setCountdown(0);
    }
    setOpen(newOpen);
  };

  const startCountdown = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {danger && <AlertTriangle className="h-5 w-5 text-red-600" />}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireConfirmation && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              请输入 <code className="bg-gray-100 px-1 rounded">{confirmationText}</code> 以确认操作
            </p>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={confirmationText}
              className="font-mono"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || (requireConfirmation && confirmation !== confirmationText)}
            className={danger ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {confirmText}
            {countdown > 0 && ` (${countdown})`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// 专门用于删除操作的确认对话框
interface DeleteConfirmDialogProps {
  itemName: string;
  itemType?: string;
  onDelete: () => Promise<void> | void;
  trigger?: React.ReactNode;
}

export function DeleteConfirmDialog({ itemName, itemType = "项目", onDelete, trigger }: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      title={`删除${itemType}`}
      description={`确定要删除 "${itemName}" 吗？此操作不可恢复。`}
      confirmText="删除"
      danger={true}
      requireConfirmation={true}
      confirmationText={`删除 ${itemName}`}
      onConfirm={onDelete}
      trigger={trigger}
    >
      {trigger || (
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          删除
        </Button>
      )}
    </ConfirmDialog>
  );
} 