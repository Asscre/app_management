import { render, screen } from '@/lib/test-utils'

describe('Simple Test', () => {
  it('should work', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should import test utils correctly', () => {
    expect(render).toBeDefined()
    expect(screen).toBeDefined()
  })
}) 