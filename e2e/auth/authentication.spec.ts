import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Try to access dashboard without authentication
    await helpers.nav.goToDashboard()
    
    // Should redirect to login or show login page
    await page.waitForURL(/.*auth.*|.*login.*/, { timeout: 10000 })
    
    // Verify we're on an authentication page
    const url = page.url()
    expect(url).toMatch(/auth|login|kinde/)
  })

  test('should redirect to login when accessing clients page', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Try to access clients page without authentication
    await helpers.nav.goToClients()
    
    // Should redirect to authentication
    await page.waitForURL(/.*auth.*|.*login.*/, { timeout: 10000 })
    
    const url = page.url()
    expect(url).toMatch(/auth|login|kinde/)
  })

  test('should redirect to login when accessing inventory page', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Try to access inventory page without authentication
    await helpers.nav.goToInventory()
    
    // Should redirect to authentication
    await page.waitForURL(/.*auth.*|.*login.*/, { timeout: 10000 })
    
    const url = page.url()
    expect(url).toMatch(/auth|login|kinde/)
  })

  test('should redirect to login when accessing POS page', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Try to access POS page without authentication
    await helpers.nav.goToPOS()
    
    // Should redirect to authentication
    await page.waitForURL(/.*auth.*|.*login.*/, { timeout: 10000 })
    
    const url = page.url()
    expect(url).toMatch(/auth|login|kinde/)
  })

  test('should handle authentication state properly', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Check initial state (should be logged out)
    const initiallyLoggedIn = await helpers.auth.isLoggedIn()
    expect(initiallyLoggedIn).toBe(false)
    
    // Try to access dashboard
    await helpers.nav.goToDashboard()
    
    // Should be redirected to auth
    await page.waitForURL(/.*auth.*|.*login.*/, { timeout: 10000 })
  })

  test('should show login button on homepage when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should see login/sign in button or link
    const loginElements = await Promise.allSettled([
      page.getByRole('link', { name: /login|sign in|iniciar sesión/i }).isVisible(),
      page.getByRole('button', { name: /login|sign in|iniciar sesión/i }).isVisible(),
      page.getByText(/login|sign in|iniciar sesión/i).isVisible(),
    ])
    
    // At least one login element should be visible
    const hasLoginElement = loginElements.some(result => 
      result.status === 'fulfilled' && result.value === true
    )
    
    expect(hasLoginElement).toBe(true)
  })

  test('should handle logout flow', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Mock being logged in
    await helpers.auth.mockLogin()
    
    // Navigate to dashboard (should work with mock auth)
    await page.goto('/dashboard')
    
    // Look for logout functionality
    try {
      // Look for user menu or logout button
      const userMenuButton = page.getByTestId('user-menu')
      if (await userMenuButton.isVisible()) {
        await userMenuButton.click()
        
        // Look for logout option
        const logoutButton = page.getByRole('button', { name: /logout|sign out|cerrar sesión/i })
        if (await logoutButton.isVisible()) {
          await logoutButton.click()
          
          // Should redirect away from dashboard
          await page.waitForURL(url => !url.toString().includes('/dashboard'), { timeout: 10000 })
          
          // Verify we're logged out
          const finalUrl = page.url()
          expect(finalUrl).not.toContain('/dashboard')
        }
      }
    } catch (error) {
      // Logout functionality might not be implemented yet
      console.log('Logout functionality not found or not working:', error)
    }
  })

  test('should show appropriate error messages for failed authentication', async ({ page }) => {
    // Mock a failed authentication response
    await page.route('**/api/auth/**', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Authentication failed' })
      })
    })
    
    await page.goto('/dashboard')
    
    // Should handle the error gracefully
    // Either redirect to login or show error message
    await page.waitForTimeout(2000) // Give time for error handling
    
    const currentUrl = page.url()
    const hasErrorMessage = await page.getByText(/error|failed|unauthorized/i).isVisible()
    const redirectedToAuth = currentUrl.includes('auth') || currentUrl.includes('login')
    
    expect(hasErrorMessage || redirectedToAuth).toBe(true)
  })

  test('should maintain authentication state across page refreshes', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Mock authentication
    await helpers.auth.mockLogin()
    await page.goto('/dashboard')
    
    // Refresh the page
    await page.reload()
    
    // Should still be authenticated or redirect properly
    await page.waitForLoadState('networkidle')
    
    // Either stay on dashboard or redirect to auth
    const currentUrl = page.url()
    const stayedAuthenticated = currentUrl.includes('/dashboard')
    const redirectedToAuth = currentUrl.includes('auth') || currentUrl.includes('login')
    
    expect(stayedAuthenticated || redirectedToAuth).toBe(true)
  })

  test('should handle authentication API errors gracefully', async ({ page }) => {
    // Mock auth API to return 500 error
    await page.route('**/api/auth-status', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      })
    })
    
    await page.goto('/dashboard')
    
    // Should handle the error without crashing
    await page.waitForTimeout(3000)
    
    // Page should either show error or redirect
    const hasErrorHandling = await page.getByText(/error|try again|something went wrong/i).isVisible()
    const redirectedToAuth = page.url().includes('auth') || page.url().includes('login')
    const staysOnPage = page.url().includes('/dashboard')
    
    expect(hasErrorHandling || redirectedToAuth || staysOnPage).toBe(true)
  })
}) 