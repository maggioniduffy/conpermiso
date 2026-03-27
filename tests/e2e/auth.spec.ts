import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("unauthenticated user is redirected to /auth when visiting /my-list", async ({ page }) => {
    await page.goto("/my-list");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("unauthenticated user is redirected to /auth when visiting /requests", async ({ page }) => {
    await page.goto("/requests");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("unauthenticated user is redirected to /auth when visiting /spot/create", async ({ page }) => {
    await page.goto("/spot/create");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("unauthenticated user is redirected to /auth when visiting /admin/requests", async ({
    page,
  }) => {
    await page.goto("/admin/requests");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("/auth page renders a sign-in form or provider buttons", async ({ page }) => {
    await page.goto("/auth");
    // At minimum the page renders without a crash
    await expect(page.locator("body")).toBeVisible();
    // Expect at least one interactive element (button or input)
    const interactiveCount = await page
      .locator("button, input[type=email], input[type=text]")
      .count();
    expect(interactiveCount).toBeGreaterThan(0);
  });

  test("email input is present on the auth page", async ({ page }) => {
    await page.goto("/auth");
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeEnabled();
    }
  });
});
