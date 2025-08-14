export interface Application {
  id: number;
  name: string;
  description: string;
  latestVersion: string;
  status: 'active' | 'maintenance' | 'deprecated';
  apiKey: string;
  createdAt: string;
  updatedAt: string;
  versions?: Version[];
}

export interface Version {
  id: number;
  appId: number;
  version: string;
  changelogMd: string;
  changelogHtml: string;
  createdAt: string;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
}

export interface CreateVersionRequest {
  version: string;
  changelogMd: string;
}

export interface MemberLevel {
  id: number;
  appId: number;
  name: string;
  level: number;
  permissions: string;
  createdAt: string;
} 