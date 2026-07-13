import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4321',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev/preview server before starting the tests */
  /* Astro 7's `astro dev` daemonizes: the invoking process prints "Dev
     server running..." then exits 0 immediately, while the real server
     keeps serving in a detached background process. Playwright's webServer
     runner treats the `command` process exiting as "the server died" and
     fails with "Process from config.webServer exited early" even though
     the server is actually fine. Chaining `&& sleep infinity` keeps this
     wrapper process alive (Playwright kills it after the run; the CI
     runner/VM is torn down right after anyway, so the orphaned daemon
     doesn't linger) so Playwright's liveness check passes once the real
     daemon starts responding on the URL below. */
  webServer: {
    command: 'pnpm exec astro dev --port 4321 && sleep infinity',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
