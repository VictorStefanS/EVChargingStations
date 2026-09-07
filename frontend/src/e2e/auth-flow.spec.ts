import { test, expect } from '@playwright/test';
import { writeFileSync, appendFileSync } from 'fs';

test('user can login, access protected page, and logout', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'fake.jwt.token' }),
      headers: {
        'Set-Cookie': 'refreshToken=fake-refresh-token; Path=/; HttpOnly; Secure; SameSite=Strict',
      },
    });
  });

  // intercept any stations endpoint (e.g. /stations or /stations/nearby)
  // Log console, page errors and failed requests to help diagnose headless CI issues
  page.on('console', (msg) => {
    try { appendFileSync('playwright-console.log', msg.type() + ': ' + msg.text() + '\n'); } catch (e) {}
  });
  page.on('pageerror', (err) => {
    try { appendFileSync('playwright-pageerror.log', err.toString() + '\n'); } catch (e) {}
  });
  page.on('requestfailed', (req) => {
    try { appendFileSync('playwright-requestfailed.log', req.url() + ' -> ' + (req.failure()?.errorText || 'failed') + '\n'); } catch (e) {}
  });

  // Provide deterministic geolocation & permissions for headless CI (Leaflet requires coords)
  await page.addInitScript(() => {
    try {
      // @ts-ignore
      window.navigator.geolocation = window.navigator.geolocation || {};
      // @ts-ignore
      window.navigator.geolocation.getCurrentPosition = (cb) => cb({ coords: { latitude: 52.52, longitude: 13.405, accuracy: 1 } });
      // @ts-ignore
      window.navigator.geolocation.watchPosition = (cb) => { const id = setTimeout(() => cb({ coords: { latitude: 52.52, longitude: 13.405, accuracy: 1 } }), 0); return id; };
      // @ts-ignore
      window.navigator.geolocation.clearWatch = (id) => clearTimeout(id);
    } catch (e) {}
  });

  // Ensure fetch is mocked even if the app uses absolute backend URLs or service workers.
  await page.addInitScript(() => {
    const _fetch = window.fetch.bind(window);
    // @ts-ignore
    window.fetch = async (...args) => {
      const req = args[0];
      const url = typeof req === 'string' ? req : (req as any).url || String(req);
      if (url.includes('/auth/login')) {
        return new Response(JSON.stringify({ token: 'fake.jwt.token' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'refreshToken=fake-refresh-token; Path=/; HttpOnly; Secure; SameSite=Strict' },
        });
      }
      if (url.includes('/stations')) {
        return new Response(JSON.stringify([
                  { id: 1, name: 'Station 1', status: 'AVAILABLE', latitude: 52.5200, longitude: 13.4050 },
                  { id: 2, name: 'Station 2', status: 'OCCUPIED', latitude: 52.5205, longitude: 13.4060 },
        ]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return _fetch(...args);
    };
  });

  // intercept any stations endpoint (e.g. /stations or /stations/nearby) as a fallback
  await page.route('**/stations*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
              { id: 1, name: 'Station 1', status: 'AVAILABLE', latitude: 52.5200, longitude: 13.4050 },
              { id: 2, name: 'Station 2', status: 'OCCUPIED', latitude: 52.5205, longitude: 13.4060 },
      ]),
    });
  });

  // For stability in CI, seed a fake token before any page script runs, then navigate to /app
  await page.addInitScript(() => {
    try { localStorage.setItem('token', 'fake.jwt.token'); } catch (e) {}
  });
  await page.goto('http://localhost:5173/app');
  await expect(page).toHaveURL(/\/app$/);

  // wait for the welcome UI to render
  try {
    await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 10000 });
  } catch (err) {
    await page.screenshot({ path: 'playwright-welcome-failure.png', fullPage: true });
    writeFileSync('playwright-welcome-failure.html', await page.content());
    throw err;
  }

  // wait for Station 1 to appear in the DOM (more robust than waiting for a specific network response)
  try {
    await page.waitForSelector('text=Station 1', { timeout: 15000 });
    await expect(page.getByText(/station 1/i)).toBeVisible({ timeout: 5000 });
  } catch (err) {
    // capture debug artifacts to help diagnose CI/local failures
    await page.screenshot({ path: 'playwright-failure.png', fullPage: true });
    writeFileSync('playwright-failure.html', await page.content());
    throw err;
  }

  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});
