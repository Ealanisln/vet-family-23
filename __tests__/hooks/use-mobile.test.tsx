import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  const listeners: Array<(event: MediaQueryListEvent) => void> = []
  
  return {
    matches,
    media: '(max-width: 767px)',
    addEventListener: jest.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        listeners.push(listener)
      }
    }),
    removeEventListener: jest.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }),
    triggerChange: (newMatches: boolean) => {
      listeners.forEach(listener => {
        listener({ matches: newMatches } as MediaQueryListEvent)
      })
    }
  }
}

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
}

describe('useIsMobile', () => {
  let matchMediaMock: ReturnType<typeof mockMatchMedia>

  beforeEach(() => {
    // Reset window.innerWidth
    mockInnerWidth(1024)
    
    // Create fresh mock for each test
    matchMediaMock = mockMatchMedia(false)
    
    // Mock window.matchMedia
    window.matchMedia = jest.fn(() => matchMediaMock as unknown as MediaQueryList)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return false for desktop width initially', () => {
    mockInnerWidth(1024)
    matchMediaMock.matches = false

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should return true for mobile width initially', () => {
    mockInnerWidth(500)
    matchMediaMock.matches = true

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return true for width exactly at mobile breakpoint (767px)', () => {
    mockInnerWidth(767)
    matchMediaMock.matches = true

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it('should return false for width just above mobile breakpoint (768px)', () => {
    mockInnerWidth(768)
    matchMediaMock.matches = false

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })

  it('should setup media query listener correctly', () => {
    renderHook(() => useIsMobile())

    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)')
    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should respond to media query changes', () => {
    mockInnerWidth(1024)
    matchMediaMock.matches = false

    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)

    // Simulate window resize to mobile
    act(() => {
      mockInnerWidth(400)
      // Trigger the media query change event
      matchMediaMock.triggerChange(true)
    })

    expect(result.current).toBe(true)

    // Simulate window resize back to desktop
    act(() => {
      mockInnerWidth(1200)
      matchMediaMock.triggerChange(false)
    })

    expect(result.current).toBe(false)
  })

  it('should cleanup event listener on unmount', () => {
    const { unmount } = renderHook(() => useIsMobile())

    unmount()

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    )
  })

  it('should handle multiple rapid window resizes', () => {
    mockInnerWidth(1024)
    matchMediaMock.matches = false

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)

    // Simulate rapid resizes
    act(() => {
      mockInnerWidth(400)
      matchMediaMock.triggerChange(true)
    })

    expect(result.current).toBe(true)

    act(() => {
      mockInnerWidth(900)
      matchMediaMock.triggerChange(false)
    })

    expect(result.current).toBe(false)

    act(() => {
      mockInnerWidth(300)
      matchMediaMock.triggerChange(true)
    })

    expect(result.current).toBe(true)
  })

  it('should handle edge case window widths', () => {
    // Test very small width
    mockInnerWidth(320)
    matchMediaMock.matches = true

    const { result: smallResult } = renderHook(() => useIsMobile())
    expect(smallResult.current).toBe(true)

    // Test very large width
    mockInnerWidth(2560)
    matchMediaMock.matches = false

    const { result: largeResult } = renderHook(() => useIsMobile())
    expect(largeResult.current).toBe(false)

    // Test zero width (edge case)
    mockInnerWidth(0)
    matchMediaMock.matches = true

    const { result: zeroResult } = renderHook(() => useIsMobile())
    expect(zeroResult.current).toBe(true)
  })

  it('should be consistent between initial render and effect', () => {
    mockInnerWidth(600)
    matchMediaMock.matches = true

    const { result } = renderHook(() => useIsMobile())

    // Should be true both initially and after effect runs
    expect(result.current).toBe(true)
  })

  it('should handle window.matchMedia not being available', () => {
    // Temporarily remove matchMedia
    const originalMatchMedia = window.matchMedia
    // @ts-expect-error - intentionally testing undefined case
    delete window.matchMedia

    expect(() => {
      renderHook(() => useIsMobile())
    }).toThrow()

    // Restore matchMedia
    window.matchMedia = originalMatchMedia
  })

  it('should return boolean value, not undefined initially', () => {
    mockInnerWidth(1024)
    matchMediaMock.matches = false

    const { result } = renderHook(() => useIsMobile())

    // Should return false, not undefined
    expect(typeof result.current).toBe('boolean')
    expect(result.current).toBe(false)
  })

  it('should handle same-size window resize events', () => {
    mockInnerWidth(400)
    matchMediaMock.matches = true

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)

    // Trigger change event but with same mobile state
    act(() => {
      matchMediaMock.triggerChange(true)
    })

    // Should remain true
    expect(result.current).toBe(true)
  })

  it('should handle common device breakpoints', () => {
    const commonBreakpoints = [
      { width: 320, expected: true, device: 'iPhone SE' },
      { width: 375, expected: true, device: 'iPhone X/11/12' },
      { width: 414, expected: true, device: 'iPhone Plus' },
      { width: 768, expected: false, device: 'iPad Portrait' },
      { width: 1024, expected: false, device: 'iPad Landscape' },
      { width: 1440, expected: false, device: 'Desktop' },
    ]

    commonBreakpoints.forEach(({ width, expected }) => {
      mockInnerWidth(width)
      matchMediaMock.matches = width < 768

      const { result } = renderHook(() => useIsMobile())

      expect(result.current).toBe(expected)
    })
  })
}) 