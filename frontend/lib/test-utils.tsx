import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'

// 自定义渲染器，包含主题提供者
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// 重新导出所有内容
export * from '@testing-library/react'
export { customRender as render }

// 测试数据
export const mockApplications = [
  {
    id: 1,
    name: '移动端APP',
    description: '企业移动应用',
    latestVersion: '1.2.0',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Web管理台',
    description: 'Web端管理系统',
    latestVersion: '2.1.0',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
]

export const mockVersions = [
  {
    id: 1,
    appId: 1,
    version: '1.2.0',
    changelogMd: '修复已知问题',
    changelogHtml: '<p>修复已知问题</p>',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    appId: 1,
    version: '1.1.0',
    changelogMd: '新增功能',
    changelogHtml: '<p>新增功能</p>',
    createdAt: '2024-01-15T09:00:00Z',
  },
]

export const mockMemberLevels = [
  {
    id: 1,
    name: '普通会员',
    level: 1,
    permissions: '{"features": ["basic"], "limits": {"api_calls": 1000}}',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: '高级会员',
    level: 2,
    permissions: '{"features": ["basic", "advanced"], "limits": {"api_calls": 5000}}',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
] 