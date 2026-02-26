import { test, expect } from '@playwright/test';

test.describe('Student Critical Journey', () => {
    test.beforeEach(async ({ page }) => {
        // Assume test user is seeded/logged in via auth state reuse
        // Using a safe placeholder URL for the scaffold
        // await page.goto('/dashboard');
    });

    // Marked as fixme because the actual UI needs `data-testid` attributes added
    test.fixme('completes a challenge, uses a hint, and views updated streak', async ({ page }) => {
        await page.goto('/dashboard');

        // 1. Open challenge
        await page.getByTestId('challenge-card-loops-01').click();
        await expect(page).toHaveURL(/.*\/challenge\/.*/);

        // 2. Request hint mechanism
        await page.getByTestId('request-hint-btn').click();
        await expect(page.getByTestId('ai-hint-box')).toBeVisible({ timeout: 10000 });
        const hintText = await page.getByTestId('ai-hint-box').textContent();
        expect(hintText?.length).toBeGreaterThan(10);

        // 3. Write code (Monaco editor interaction)
        await page.evaluate(() => {
            window.monaco.editor.getModels()[0].setValue('for i in range(5):\n    print(i)');
        });

        // 4. Submit & Verify
        await page.getByTestId('submit-code-btn').click();
        await expect(page.getByTestId('submission-success-modal')).toBeVisible({ timeout: 15000 });

        // 5. Check streak update
        await page.getByTestId('nav-dashboard').click();
        await expect(page.getByTestId('current-streak-counter')).toHaveText(/1\s*(day|days)!?/i);
    });
});
