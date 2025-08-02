import { render, screen, waitFor } from '@/lib/test-utils'
import { mockApplications } from '@/lib/test-utils'
import AppsPage from '../apps/page'

// Mock the API functions
jest.mock('@/lib/api', () => ({
  getApplications: jest.fn(),
  createApplication: jest.fn(),
  deleteApplication: jest.fn(),
}))

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AppsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders page title and add button', () => {
    render(<AppsPage />)
    
    expect(screen.getByText('应用管理')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /新增应用/i })).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    render(<AppsPage />)
    
    expect(screen.getByText(/加载中/i)).toBeInTheDocument()
  })

  it('displays empty state when no applications', async () => {
    const { getApplications } = require('@/lib/api')
    getApplications.mockResolvedValue([])

    render(<AppsPage />)

    await waitFor(() => {
      expect(screen.getByText(/暂无应用/i)).toBeInTheDocument()
    })
  })

  it('displays applications when data is loaded', async () => {
    const { getApplications } = require('@/lib/api')
    getApplications.mockResolvedValue(mockApplications)

    render(<AppsPage />)

    await waitFor(() => {
      expect(screen.getByText('移动端APP')).toBeInTheDocument()
      expect(screen.getByText('Web管理台')).toBeInTheDocument()
    })
  })

  it('shows error state when API fails', async () => {
    const { getApplications } = require('@/lib/api')
    getApplications.mockRejectedValue(new Error('API Error'))

    render(<AppsPage />)

    await waitFor(() => {
      expect(screen.getByText(/加载失败/i)).toBeInTheDocument()
    })
  })

  it('opens create form when add button is clicked', async () => {
    const user = require('@testing-library/user-event').default.setup()
    
    render(<AppsPage />)

    const addButton = screen.getByRole('button', { name: /新增应用/i })
    await user.click(addButton)

    await waitFor(() => {
      expect(screen.getByText(/新增应用/i)).toBeInTheDocument()
    })
  })

  it('displays search functionality', () => {
    render(<AppsPage />)
    
    expect(screen.getByPlaceholderText(/搜索应用/i)).toBeInTheDocument()
  })

  it('filters applications based on search', async () => {
    const user = require('@testing-library/user-event').default.setup()
    const { getApplications } = require('@/lib/api')
    getApplications.mockResolvedValue(mockApplications)

    render(<AppsPage />)

    await waitFor(() => {
      expect(screen.getByText('移动端APP')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/搜索应用/i)
    await user.type(searchInput, '移动端')

    await waitFor(() => {
      expect(screen.getByText('移动端APP')).toBeInTheDocument()
      expect(screen.queryByText('Web管理台')).not.toBeInTheDocument()
    })
  })

  it('displays application cards with correct information', async () => {
    const { getApplications } = require('@/lib/api')
    getApplications.mockResolvedValue(mockApplications)

    render(<AppsPage />)

    await waitFor(() => {
      expect(screen.getByText('移动端APP')).toBeInTheDocument()
      expect(screen.getByText('企业移动应用')).toBeInTheDocument()
      expect(screen.getByText('v1.2.0')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })

  it('handles application deletion', async () => {
    const user = require('@testing-library/user-event').default.setup()
    const { getApplications, deleteApplication } = require('@/lib/api')
    getApplications.mockResolvedValue(mockApplications)
    deleteApplication.mockResolvedValue({ success: true })

    render(<AppsPage />)

    await waitFor(() => {
      expect(screen.getByText('移动端APP')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByRole('button', { name: /删除/i })
    await user.click(deleteButtons[0])

    await waitFor(() => {
      expect(deleteApplication).toHaveBeenCalledWith(mockApplications[0].id)
    })
  })
}) 