import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

// Mock timers
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 300 })
    
    // Should still be initial value before delay
    expect(result.current).toBe('initial')

    // Fast-forward time by 299ms (just before delay)
    act(() => {
      jest.advanceTimersByTime(299)
    })
    
    expect(result.current).toBe('initial')

    // Fast-forward remaining 1ms to complete delay
    act(() => {
      jest.advanceTimersByTime(1)
    })
    
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    // Change value rapidly multiple times
    rerender({ value: 'first', delay: 300 })
    
    act(() => {
      jest.advanceTimersByTime(100)
    })
    
    rerender({ value: 'second', delay: 300 })
    
    act(() => {
      jest.advanceTimersByTime(100)
    })
    
    rerender({ value: 'final', delay: 300 })

    // Should still be initial value as timer keeps resetting
    expect(result.current).toBe('initial')

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Should now show the final value
    expect(result.current).toBe('final')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    rerender({ value: 'updated', delay: 100 })

    // Should update after 100ms with new delay
    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(result.current).toBe('updated')
  })

  it('should work with different data types', () => {
    // Test with numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } }
    )

    numberRerender({ value: 42, delay: 200 })
    
    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(numberResult.current).toBe(42)

    // Test with objects
    const initialObj = { id: 1, name: 'test' }
    const updatedObj = { id: 2, name: 'updated' }
    
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    )

    objectRerender({ value: updatedObj, delay: 200 })
    
    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(objectResult.current).toBe(updatedObj)

    // Test with arrays
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 200 } }
    )

    arrayRerender({ value: [4, 5, 6], delay: 200 })
    
    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(arrayResult.current).toEqual([4, 5, 6])
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'updated', delay: 0 })

    // With zero delay, should update immediately after next tick
    act(() => {
      jest.advanceTimersByTime(0)
    })

    expect(result.current).toBe('updated')
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    rerender({ value: 'updated', delay: 300 })
    
    // Unmount before timeout completes
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
    
    clearTimeoutSpy.mockRestore()
  })

  it('should handle value not changing', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'same', delay: 300 } }
    )

    // Rerender with same value
    rerender({ value: 'same', delay: 300 })

    act(() => {
      jest.advanceTimersByTime(300)
    })

    expect(result.current).toBe('same')
  })

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string | null | undefined, delay: number }) => useDebounce(value, delay),
      { initialProps: { value: null as string | null | undefined, delay: 200 } }
    )

    expect(result.current).toBeNull()

    rerender({ value: undefined, delay: 200 })

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toBeUndefined()

    rerender({ value: 'not null', delay: 200 })

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toBe('not null')
  })
}) 