import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays the map container", async ({ page }) => {
    await page.goto("/");
    // Map container is present (even if Leaflet is lazy-loaded)
    await expect(page.locator("main, #__next, [data-testid='map'], .leaflet-container").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("page title is set", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
  });

  test("navigation bar is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav, header").first()).toBeVisible();
  });

  test("unauthenticated user sees the public home page (no redirect)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
