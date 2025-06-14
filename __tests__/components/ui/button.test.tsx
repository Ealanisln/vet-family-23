import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('should render different variants correctly', () => {
    const { rerender } = render(<Button variant="destructive">Destructive</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    
    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('border', 'border-input', 'bg-background')
    
    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    
    rerender(<Button variant="ghost">Ghost</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
    
    rerender(<Button variant="link">Link</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('text-primary', 'underline-offset-4')
  })

  it('should render different sizes correctly', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    
    let button = screen.getByRole('button')
    expect(button).toHaveClass('h-9', 'px-3')
    
    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'px-8')
    
    rerender(<Button size="icon">Icon</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('h-10', 'w-10')
  })

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should render as a child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should handle keyboard events', () => {
    const handleKeyDown = jest.fn()
    render(<Button onKeyDown={handleKeyDown}>Keyboard</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    
    expect(handleKeyDown).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should have correct accessibility attributes', () => {
    render(<Button aria-label="Close dialog">×</Button>)
    
    const button = screen.getByRole('button', { name: /close dialog/i })
    expect(button).toHaveAttribute('aria-label', 'Close dialog')
  })

  it('should support focus management', () => {
    render(<Button>Focus me</Button>)
    
    const button = screen.getByRole('button')
    button.focus()
    
    expect(button).toHaveFocus()
    expect(button).toHaveClass('focus-visible:outline-none')
  })
}) 