import { renderHook, waitFor } from '@testing-library/react'
import { useAuthStatus } from '@/hooks/auth-status'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useAuthStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    // Mock pending fetch
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useAuthStatus())

    expect(result.current).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    })
  })

  it('should handle successful authentication', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockUser,
        isAuthenticated: true
      })
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/auth-status')
  })

  it('should handle unauthenticated state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: null,
        isAuthenticated: false
      })
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  })

  it('should handle fetch failure with HTTP error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Failed to fetch auth status',
    })
  })

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Network error',
    })
  })

  it('should handle unknown error types', async () => {
    mockFetch.mockRejectedValueOnce('Unknown error')

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'An unknown error occurred',
    })
  })

  it('should handle malformed JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: 'Invalid JSON',
    })
  })

  it('should handle partial user data', async () => {
    const partialUser = {
      id: 'user123',
      email: 'test@example.com'
      // Missing firstName, lastName
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: partialUser,
        isAuthenticated: true
      })
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: partialUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  })

  it('should handle server error responses (500)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch auth status')
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should handle abort signal', async () => {
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'
    
    mockFetch.mockRejectedValueOnce(abortError)

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('The operation was aborted')
  })

  it('should handle timeout error', async () => {
    const timeoutError = new Error('Request timeout')
    mockFetch.mockRejectedValueOnce(timeoutError)

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Request timeout')
  })

  it('should not make multiple requests on re-renders', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 'user123' },
        isAuthenticated: true
      })
    })

    const { result, rerender } = renderHook(() => useAuthStatus())

    // Wait for initial request to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Rerender the hook multiple times
    rerender()
    rerender()
    rerender()

    // Should only have made one fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should handle empty response gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current).toEqual({
      user: undefined, // Since undefined was returned from API
      isAuthenticated: undefined, // Since undefined was returned from API
      isLoading: false,
      error: null,
    })
  })

  it('should handle null response data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null
    })

    const { result } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should handle null response without crashing
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).not.toBeNull()
  })

  it('should make request to correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: null,
        isAuthenticated: false
      })
    })

    renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth-status')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should maintain referential stability when data does not change', async () => {
    const userData = { id: 'user123', email: 'test@example.com' }
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: userData,
        isAuthenticated: true
      })
    })

    const { result, rerender } = renderHook(() => useAuthStatus())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const firstRender = result.current

    rerender()

    // Since the hook doesn't make new requests on re-render,
    // the result should be the same object reference
    expect(result.current).toBe(firstRender)
  })

  it('should handle different HTTP status codes appropriately', async () => {
    const statusCodes = [
      { status: 401, expected: 'Failed to fetch auth status' },
      { status: 403, expected: 'Failed to fetch auth status' },
      { status: 404, expected: 'Failed to fetch auth status' },
      { status: 500, expected: 'Failed to fetch auth status' },
      { status: 503, expected: 'Failed to fetch auth status' },
    ]

    for (const { status, expected } of statusCodes) {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status,
        statusText: `HTTP ${status}`
      })

      const { result } = renderHook(() => useAuthStatus())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(expected)
      
      // Reset for next iteration
      jest.clearAllMocks()
    }
  })
}) 