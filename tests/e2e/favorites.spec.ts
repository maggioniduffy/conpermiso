import { test, expect } from "@playwright/test";

// These tests require an authenticated session.
// They use storageState set via a helper or a pre-authenticated fixture.
// If no session exists the tests gracefully verify the redirect behaviour.

test.describe("Favorites page (/my-list)", () => {
  test("redirects to /auth when not authenticated", async ({ page }) => {
    await page.goto("/my-list");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("authenticated user sees the Favorites heading or content area", async ({
    page,
    context,
  }) => {
    // Skip if we don't have an auth fixture
    const cookies = await context.cookies();
    const hasSession = cookies.some((c) =>
      c.name.includes("next-auth") || c.name.includes("session"),
    );
    if (!hasSession) {
      test.skip();
      return;
    }

    await page.goto("/my-list");
    await expect(page).toHaveURL("/my-list");
    await expect(page.locator("h1, h2, [data-testid='favorites-heading']").first()).toBeVisible();
  });

  test("favorites list shows empty-state icon when no favorites (authenticated)", async ({
    page,
    context,
  }) => {
    const cookies = await context.cookies();
    const hasSession = cookies.some((c) =>
      c.name.includes("next-auth") || c.name.includes("session"),
    );
    if (!hasSession) {
      test.skip();
      return;
    }

    await page.goto("/my-list");
    // Either favorites are listed or the empty state is shown
    const emptyState = page.getByText(/Agrega algún local/i);
    const favCard = page.locator("[data-testid='spot-card'], article").first();
    await expect(emptyState.or(favCard)).toBeVisible({ timeout: 8_000 });
  });
});
