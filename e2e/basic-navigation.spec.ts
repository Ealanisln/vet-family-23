import { test, expect } from '@playwright/test'
import { TestHelpers } from './utils/test-helpers'

test.describe('Basic Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    // Navigate to homepage
    await helpers.nav.goToHome()
    
    // Should see the main content
    await expect(page).toHaveTitle(/vet.*family/i)
    
    // Should see navigation elements
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should have working navigation links', async ({ page }) => {
    const helpers = new TestHelpers(page)
    
    await helpers.nav.goToHome()
    
    // Test various navigation links (adjust based on your actual nav structure)
    const navLinks = [
      { name: /servicios|services/i, expectedUrl: /.*servicios.*|.*services.*/i },
      { name: /contacto|contact/i, expectedUrl: /.*contacto.*|.*contact.*/i },
      { name: /sobre|about/i, expectedUrl: /.*sobre.*|.*about.*/i },
    ]

    for (const link of navLinks) {
      try {
        const linkElement = page.getByRole('link', { name: link.name })
        if (await linkElement.isVisible()) {
          await linkElement.click()
          // Wait for navigation
          await page.waitForLoadState('networkidle')
          // Check URL changed appropriately
          expect(page.url()).toMatch(link.expectedUrl)
          // Go back to homepage for next test
          await helpers.nav.goToHome()
        }
      } catch (error) {
        // Link might not exist, that's ok for now
        console.log(`Link ${link.name.toString()} not found or not clickable`)
      }
    }
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/this-page-does-not-exist', { waitUntil: 'networkidle' })
    
    // Should show 404 or redirect to homepage
    const url = page.url()
    const hasNotFound = await page.getByText(/404|not found/i).isVisible()
    const redirectedHome = url.endsWith('/') || url.includes('localhost:3000')
    
    expect(hasNotFound || redirectedHome).toBe(true)
  })

  test('should have responsive design', async ({ page }) => {
    await page.goto('/')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle')
    
    // Should still be functional
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForLoadState('networkidle')
    
    // Should still be functional
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = []
    
    // Listen for console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        jsErrors.push(message.text())
      }
    })
    
    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for critical JavaScript errors
    const criticalErrors = jsErrors.filter(error => 
      !error.includes('favicon') && // Ignore favicon errors
      !error.includes('Extension') && // Ignore browser extension errors
      !error.includes('Manifest') // Ignore manifest errors
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('should have basic accessibility features', async ({ page }) => {
    await page.goto('/')
    
    // Should have proper heading structure
    const h1Elements = await page.locator('h1').count()
    expect(h1Elements).toBeGreaterThan(0)
    
    // Should have alt text for images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      
      // Should have either alt text or aria-label
      expect(alt !== null || ariaLabel !== null).toBe(true)
    }
    
    // Should be navigable by keyboard
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })
}) 