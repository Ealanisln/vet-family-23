/**
 * Simple test to verify Jest setup is working
 */

describe('Jest Setup', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true)
  })

  it('should have access to console methods', () => {
    expect(typeof console.log).toBe('function')
    expect(typeof console.error).toBe('function')
  })

  it('should support async/await', async () => {
    const promise = Promise.resolve('test')
    const result = await promise
    expect(result).toBe('test')
  })

  it('should support mocking', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
}) 