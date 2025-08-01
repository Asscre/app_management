import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, AppWindow, Upload, Trash2, Settings } from "lucide-react";
import { Application } from "@/types/app";
import { ReleaseVersionDialog } from "./ReleaseVersionDialog";

interface AppCardProps {
  app: Application;
  onDeleteApp?: (id: number) => Promise<void>;
  onReleaseVersion?: (appId: number, data: any) => Promise<void>;
}

export function AppCard({ app, onDeleteApp, onReleaseVersion }: AppCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    deprecated: 'bg-red-100 text-red-800'
  };

  const statusText = {
    active: '运行中',
    maintenance: '维护中',
    deprecated: '已废弃'
  };

  const handleDelete = async () => {
    if (onDeleteApp) {
      try {
        await onDeleteApp(app.id);
      } catch (error) {
        console.error('删除应用失败:', error);
      }
    }
  };

  return (
    <Card className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <AppWindow className="h-5 w-5 text-blue-600" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onReleaseVersion && (
                <DropdownMenuItem asChild>
                  <div>
                    <ReleaseVersionDialog
                      appId={app.id}
                      appName={app.name}
                      currentVersion={app.latestVersion}
                      onReleaseVersion={onReleaseVersion}
                    />
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                应用设置
              </DropdownMenuItem>
              {onDeleteApp && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除应用
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{app.name}</CardTitle>
        <CardDescription className="text-gray-500">{app.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Badge variant="outline">v{app.latestVersion}</Badge>
        <Badge className={statusColors[app.status]}>{statusText[app.status]}</Badge>
      </CardFooter>
    </Card>
  );
} 