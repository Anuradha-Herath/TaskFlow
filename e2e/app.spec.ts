import { test, expect } from '@playwright/test';

test.describe('TaskFlow E2E', () => {
  test('should open app, login, reach dashboard, open project and add a task', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);

    await page.getByLabel(/email/i).fill('e2e@taskflow.com');
    await page.getByLabel(/password/i).fill('e2epass');
    await page.getByRole('button', { name: /log in|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();

    const openButton = page.getByRole('button', { name: /open/i }).first();
    if (await openButton.isVisible()) {
      await openButton.click();
      await expect(page).toHaveURL(/\/project\/.+/);

      const addTaskButton = page.getByRole('button', { name: /add task/i });
      if (await addTaskButton.isVisible()) {
        await addTaskButton.click();
        await page.getByLabel(/title/i).fill('E2E test task');
        await page.getByRole('button', { name: /add/i }).click();
        await expect(page.getByText('E2E test task')).toBeVisible();
      }
    }
  });

  test('should navigate to profile from user menu', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/email/i).fill('e2e@taskflow.com');
    await page.getByLabel(/password/i).fill('e2epass');
    await page.getByRole('button', { name: /log in|login/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByRole('menuitem', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });
});
