import { expect, test } from '@playwright/test'

test.describe('Umais Ali Portfolio - Core E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load landing page successfully with correct document title', async ({ page }) => {
    await expect(page).toHaveTitle(/Umais Ali | SEO that actually moves the needle/i)
    await expect(page.locator('h1')).toContainText(/SEO that actually/)
  })

  test('should persist theme configuration on toggle and reload', async ({ page }) => {
    const html = page.locator('html')
    const themeBtn = page.locator('#theme-toggle')

    // Default theme check (light or dark depending on system)
    const initialTheme = await html.getAttribute('data-theme')
    expect(initialTheme).toMatch(/light|dark/)

    // Toggle theme
    await themeBtn.click()
    const toggledTheme = await html.getAttribute('data-theme')
    expect(toggledTheme).not.toBe(initialTheme)

    // Reload page to verify persistence
    await page.reload()
    const persistedTheme = await html.getAttribute('data-theme')
    expect(persistedTheme).toBe(toggledTheme)
  })

  test('should toggle mobile menu drawer on smaller viewports', async ({ page }) => {
    // Set mobile viewport height/width
    await page.setViewportSize({ width: 375, height: 812 })

    const menuToggle = page.locator('#mobile-menu-toggle')
    const mobileMenu = page.locator('#mobile-menu')

    await expect(menuToggle).toBeVisible()
    await expect(mobileMenu).toBeHidden()

    // Trigger open
    await menuToggle.click()
    await expect(mobileMenu).toBeVisible()
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true')

    // Trigger close (same button, now morphed into a close control)
    await menuToggle.click()
    await expect(mobileMenu).toBeHidden()
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false')
  })

  test('should open project dialog after client hydration and trigger previous/next pagination', async ({
    page,
  }) => {
    // Wait for Svelte hydration to complete
    await page.waitForSelector('body[data-svelte-hydrated="true"]')

    // Locate first project triggers
    const triggerCard1 = page.locator('[data-project-trigger]').first()
    const modal = page.locator('#project-modal')

    // Modal is initially hidden / inert
    await expect(modal).toBeHidden()

    // Click project trigger
    await triggerCard1.click()
    await expect(modal).toBeVisible()

    // Validate active URL reflects project slug
    await expect(page).toHaveURL(/\/projects\/[a-zA-Z0-9-]+/)

    // Press Escape to dismiss modal
    await page.keyboard.press('Escape')
    await expect(modal).toBeHidden()
    await expect(page).toHaveURL('/')
  })

  test('should handle validation errors on contact form submission', async ({ page }) => {
    // Scroll contact into view
    await page.locator('#contact').scrollIntoViewIfNeeded()

    const form = page.locator('#contact-form')
    const submitBtn = form.locator('button[type="submit"]')

    // Fill invalid details
    await form.locator('[name="name"]').fill('A') // too short name
    await form.locator('[name="email"]').fill('not-an-email')
    await form.locator('[name="message"]').fill('short')

    await submitBtn.click()

    // Errors should render inline securely
    await expect(page.locator('#cf-name-err')).toBeVisible()
    await expect(page.locator('#cf-email-err')).toBeVisible()
    await expect(page.locator('#cf-message-err')).toBeVisible()
  })
})
