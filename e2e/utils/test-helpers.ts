import { Page, expect } from '@playwright/test'

// Test user data
export const TEST_USER = {
  email: 'test@vet-family.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1-555-0123',
}

export const TEST_PET = {
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  weight: '25.5',
  gender: 'Male',
}

export const TEST_INVENTORY_ITEM = {
  name: 'Premium Dog Food',
  category: 'FOOD',
  description: 'High quality dog food for all ages',
  quantity: '50',
  minStock: '10',
  price: '29.99',
}

// Navigation helpers
export class NavigationHelpers {
  constructor(private page: Page) {}

  async goToHome() {
    await this.page.goto('/')
  }

  async goToDashboard() {
    await this.page.goto('/dashboard')
  }

  async goToClients() {
    await this.page.goto('/dashboard/clients')
  }

  async goToInventory() {
    await this.page.goto('/dashboard/inventory')
  }

  async goToPOS() {
    await this.page.goto('/dashboard/pos')
  }

  async goToLogin() {
    await this.page.goto('/api/auth/login')
  }

  async goToLogout() {
    await this.page.goto('/api/auth/logout')
  }
}

// Authentication helpers
export class AuthHelpers {
  constructor(private page: Page) {}

  async waitForAuth() {
    // Wait for either login page or authenticated dashboard
    await Promise.race([
      this.page.waitForURL('/dashboard', { timeout: 10000 }),
      this.page.waitForURL(/.*auth.*/, { timeout: 10000 }),
    ])
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on a dashboard page or have auth indicators
      const url = this.page.url()
      return url.includes('/dashboard') || 
             await this.page.getByTestId('user-menu').isVisible()
    } catch {
      return false
    }
  }

  async mockLogin() {
    // Mock authentication for testing
    await this.page.addInitScript(() => {
      // Mock Kinde authentication state
      Object.defineProperty(window, 'isAuthenticated', {
        value: true,
        writable: true
      })
    })
  }

  async expectToBeLoggedIn() {
    await expect(this.page).toHaveURL(/.*dashboard.*/)
  }

  async expectToBeLoggedOut() {
    await expect(this.page).not.toHaveURL(/.*dashboard.*/)
  }
}

// Form helpers
export class FormHelpers {
  constructor(private page: Page) {}

  async fillClientForm(client = TEST_USER) {
    await this.page.getByLabel('First Name').fill(client.firstName)
    await this.page.getByLabel('Last Name').fill(client.lastName)
    await this.page.getByLabel('Email').fill(client.email)
    await this.page.getByLabel('Phone').fill(client.phone)
  }

  async fillPetForm(pet = TEST_PET) {
    await this.page.getByLabel('Pet Name').fill(pet.name)
    await this.page.getByLabel('Species').fill(pet.species)
    await this.page.getByLabel('Breed').fill(pet.breed)
    await this.page.getByLabel('Weight').fill(pet.weight)
    await this.page.getByLabel('Gender').selectOption(pet.gender)
  }

  async fillInventoryForm(item = TEST_INVENTORY_ITEM) {
    await this.page.getByLabel('Item Name').fill(item.name)
    await this.page.getByLabel('Category').selectOption(item.category)
    await this.page.getByLabel('Description').fill(item.description)
    await this.page.getByLabel('Quantity').fill(item.quantity)
    await this.page.getByLabel('Minimum Stock').fill(item.minStock)
    await this.page.getByLabel('Price').fill(item.price)
  }

  async submitForm() {
    await this.page.getByRole('button', { name: /submit|save|create/i }).click()
  }

  async clickCancel() {
    await this.page.getByRole('button', { name: /cancel/i }).click()
  }
}

// UI interaction helpers
export class UIHelpers {
  constructor(private page: Page) {}

  async clickButton(name: string | RegExp) {
    await this.page.getByRole('button', { name }).click()
  }

  async clickLink(name: string | RegExp) {
    await this.page.getByRole('link', { name }).click()
  }

  async openModal(buttonName: string | RegExp) {
    await this.clickButton(buttonName)
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  async closeModal() {
    await this.page.getByRole('button', { name: /close|×/i }).click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden' })
  }

  async waitForToast(message?: string | RegExp) {
    const toast = this.page.getByRole('status') // Toast notifications typically have status role
    await expect(toast).toBeVisible()
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async waitForLoadingToFinish() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid="loading"], .spinner', { 
      state: 'hidden',
      timeout: 5000 
    }).catch(() => {
      // Loading might not be present, that's ok
    })
  }

  async searchInTable(searchTerm: string) {
    await this.page.getByPlaceholder(/search/i).fill(searchTerm)
    await this.waitForLoadingToFinish()
  }
}

// Create a combined helper class
export class TestHelpers {
  nav: NavigationHelpers
  auth: AuthHelpers
  form: FormHelpers
  ui: UIHelpers

  constructor(public page: Page) {
    this.nav = new NavigationHelpers(page)
    this.auth = new AuthHelpers(page)
    this.form = new FormHelpers(page)
    this.ui = new UIHelpers(page)
  }
}

// Utility functions
export async function waitForNetworkIdle(page: Page, timeout = 1000) {
  await page.waitForLoadState('networkidle', { timeout })
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
}

export async function mockApiResponse(page: Page, url: string, response: unknown) {
  await page.route(url, async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
} 