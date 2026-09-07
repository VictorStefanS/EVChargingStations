import { test, expect } from '@playwright/test';

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
  await page.route('**/stations*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Station 1', status: 'AVAILABLE' },
        { id: 2, name: 'Station 2', status: 'OCCUPIED' },
      ]),
    });
  });

  await page.goto('http://localhost:5173/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByText(/welcome back/i)).toBeVisible();
  try {
    await expect(page.getByText(/station 1/i)).toBeVisible({ timeout: 10000 });
  } catch (err) {
    // capture debug artifacts to help diagnose CI/local failures
    await page.screenshot({ path: 'playwright-failure.png', fullPage: true });
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('playwright-failure.html', html);
    throw err;
  }

  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});
