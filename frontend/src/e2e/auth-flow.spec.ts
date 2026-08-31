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

  await page.route('**/stations', async (route) => {
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
  await expect(page.getByText(/station 1/i)).toBeVisible();

  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});
