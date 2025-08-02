import { render, screen, fireEvent, waitFor } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { AppForm } from '../app-form'

describe('AppForm', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form with all fields', () => {
    render(
      <AppForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByLabelText(/应用名称/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/应用描述/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /保存/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /取消/i })).toBeInTheDocument()
  })

  it('renders with initial values when editing', () => {
    const initialData = {
      id: 1,
      name: '测试应用',
      description: '这是一个测试应用',
      latestVersion: '1.0.0',
      status: 'active',
    }

    render(
      <AppForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByDisplayValue('测试应用')).toBeInTheDocument()
    expect(screen.getByDisplayValue('这是一个测试应用')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <AppForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByRole('button', { name: /保存/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/应用名称是必填项/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('validates name length', async () => {
    const user = userEvent.setup()
    
    render(
      <AppForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText(/应用名称/i)
    await user.type(nameInput, 'A')

    const submitButton = screen.getByRole('button', { name: /保存/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/应用名称长度必须在2-20个字符之间/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    
    render(
      <AppForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText(/应用名称/i)
    const descriptionInput = screen.getByLabelText(/应用描述/i)

    await user.type(nameInput, '测试应用')
    await user.type(descriptionInput, '这是一个测试应用')

    const submitButton = screen.getByRole('button', { name: /保存/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: '测试应用',
        description: '这是一个测试应用',
      })
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <AppForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /取消/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('handles description as optional field', async () => {
    const user = userEvent.setup()
    
    render(
      <AppForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText(/应用名称/i)
    await user.type(nameInput, '测试应用')

    const submitButton = screen.getByRole('button', { name: /保存/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: '测试应用',
        description: '',
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    const mockAsyncSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(
      <AppForm
        onSubmit={mockAsyncSubmit}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText(/应用名称/i)
    const descriptionInput = screen.getByLabelText(/应用描述/i)

    await user.type(nameInput, '测试应用')
    await user.type(descriptionInput, '这是一个测试应用')

    const submitButton = screen.getByRole('button', { name: /保存/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/保存中/i)).toBeInTheDocument()
  })
}) 