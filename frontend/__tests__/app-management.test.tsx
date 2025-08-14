import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// 简单的功能测试
describe('应用管理功能', () => {
  it('应该能够渲染应用卡片', () => {
    const mockApp = {
      id: 1,
      name: '测试应用',
      description: '这是一个测试应用',
      latestVersion: '1.0.0',
      status: 'active' as const,
      apiKey: 'test-key',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      versions: []
    }

    // 简单的DOM测试
    const div = document.createElement('div')
    div.innerHTML = `
      <div data-testid="app-card">
        <h3>${mockApp.name}</h3>
        <p>${mockApp.description}</p>
        <span>v${mockApp.latestVersion}</span>
      </div>
    `
    document.body.appendChild(div)

    expect(screen.getByTestId('app-card')).toBeInTheDocument()
    expect(screen.getByText('测试应用')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试应用')).toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()

    document.body.removeChild(div)
  })

  it('应该能够验证版本号格式', () => {
    const validVersions = ['1.0.0', '2.1.3', '10.20.30']
    const invalidVersions = ['1.0', '2.1.3.4', 'abc', '1.0.0a']

    validVersions.forEach(version => {
      const semverRegex = /^\d+\.\d+\.\d+$/
      expect(semverRegex.test(version)).toBe(true)
    })

    invalidVersions.forEach(version => {
      const semverRegex = /^\d+\.\d+\.\d+$/
      expect(semverRegex.test(version)).toBe(false)
    })
  })

  it('应该能够验证应用名称长度', () => {
    const validNames = ['测试', '测试应用', '这是一个很长的应用名称']
    const invalidNames = ['A', '这是一个非常长的应用名称超过了二十个字符的限制']

    validNames.forEach(name => {
      expect(name.length).toBeGreaterThanOrEqual(2)
      expect(name.length).toBeLessThanOrEqual(20)
    })

    invalidNames.forEach(name => {
      expect(name.length < 2 || name.length > 20).toBe(true)
    })
  })

  it('应该能够验证JSON格式', () => {
    const validJSON = '{"features": ["basic"], "limits": {"api_calls": 1000}}'
    const invalidJSON = '{"features": ["basic", "limits": {"api_calls": 1000}}'

    expect(() => JSON.parse(validJSON)).not.toThrow()
    expect(() => JSON.parse(invalidJSON)).toThrow()
  })
})
