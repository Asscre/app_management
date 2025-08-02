import { render, screen, fireEvent } from '@/lib/test-utils'
import { mockApplications } from '@/lib/test-utils'
import { AppCard } from '../app-card'

describe('AppCard', () => {
  const mockApp = mockApplications[0]
  const mockOnEdit = jest.fn()
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders app information correctly', () => {
    render(
      <AppCard
        app={mockApp}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText(mockApp.name)).toBeInTheDocument()
    expect(screen.getByText(mockApp.description)).toBeInTheDocument()
    expect(screen.getByText(`v${mockApp.latestVersion}`)).toBeInTheDocument()
  })

  it('displays status badge', () => {
    render(
      <AppCard
        app={mockApp}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const statusBadge = screen.getByText(mockApp.status)
    expect(statusBadge).toBeInTheDocument()
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('calls onEdit when edit button is clicked', () => {
    render(
      <AppCard
        app={mockApp}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(mockApp)
  })

  it('calls onDelete when delete button is clicked', () => {
    render(
      <AppCard
        app={mockApp}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(mockApp)
  })

  it('renders with inactive status', () => {
    const inactiveApp = { ...mockApp, status: 'inactive' }
    
    render(
      <AppCard
        app={inactiveApp}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    const statusBadge = screen.getByText('inactive')
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('handles missing latest version', () => {
    const appWithoutVersion = { ...mockApp, latestVersion: null }
    
    render(
      <AppCard
        app={appWithoutVersion}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('v-')).toBeInTheDocument()
  })

  it('handles missing description', () => {
    const appWithoutDescription = { ...mockApp, description: null }
    
    render(
      <AppCard
        app={appWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    )

    expect(screen.getByText('暂无描述')).toBeInTheDocument()
  })
}) 