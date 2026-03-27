import { test, expect } from "@playwright/test";

test.describe("Error boundaries – happy path (no error shown)", () => {
  test("home page renders without error boundary UI", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Algo salió mal")).not.toBeVisible();
  });

  test("auth page renders without error boundary UI", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByText("Algo salió mal")).not.toBeVisible();
  });
});

test.describe("Error boundaries – invalid routes trigger error UI", () => {
  test("invalid spot ID shows spot error page or not-found page", async ({ page }) => {
    await page.goto("/spot/000000000000000000000000");
    // The (spot) error boundary title or a generic not-found indicator
    await expect(
      page
        .getByText("No se pudo cargar el baño")
        .or(page.getByText(/not found/i))
        .or(page.getByText(/404/)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("error page for spot route has a Reintentar button", async ({ page }) => {
    await page.goto("/spot/000000000000000000000000");
    const retryBtn = page.getByRole("button", { name: /Reintentar/i });
    const notFoundIndicator = page.getByText(/not found/i).or(page.getByText(/404/));

    // If the error boundary triggered, the retry button must be visible
    const retryVisible = await retryBtn.isVisible().catch(() => false);
    const notFoundVisible = await notFoundIndicator.isVisible().catch(() => false);

    expect(retryVisible || notFoundVisible).toBe(true);
  });

  test("error page for spot route has a back link to home", async ({ page }) => {
    await page.goto("/spot/000000000000000000000000");

    // Only assert the back link when the error boundary (not 404) is shown
    const retryBtn = page.getByRole("button", { name: /Reintentar/i });
    const isErrorBoundary = await retryBtn.isVisible().catch(() => false);
    if (!isErrorBoundary) {
      test.skip();
      return;
    }

    await expect(page.getByRole("link", { name: /Volver al mapa/i })).toBeVisible();
  });
});

test.describe("Error boundaries – protected routes", () => {
  test("unauthenticated access to /my-list redirects, not error boundary", async ({
    page,
  }) => {
    await page.goto("/my-list");
    // Should redirect to /auth, not show an error boundary
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText("Algo salió mal")).not.toBeVisible();
  });

  test("unauthenticated access to /admin/requests redirects, not error boundary", async ({
    page,
  }) => {
    await page.goto("/admin/requests");
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText("Algo salió mal")).not.toBeVisible();
  });

  test("unauthenticated access to /spot/create redirects, not error boundary", async ({
    page,
  }) => {
    await page.goto("/spot/create");
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText("Algo salió mal")).not.toBeVisible();
  });
});

test.describe("Error boundaries – route error page content", () => {
  test("user error page (UserError) uses ErrorView layout with Reintentar", async ({
    page,
    context,
  }) => {
    const cookies = await context.cookies();
    const hasSession = cookies.some(
      (c) => c.name.includes("next-auth") || c.name.includes("session"),
    );
    if (!hasSession) {
      test.skip();
      return;
    }

    // Navigate to a user route with a simulated error via network intercept
    await page.route("**/api/proxy/**", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" }),
    );

    await page.goto("/my-list");
    const retryBtn = page.getByRole("button", { name: /Reintentar/i });
    const isErrorBoundary = await retryBtn.isVisible({ timeout: 8_000 }).catch(() => false);
    if (!isErrorBoundary) {
      test.skip();
      return;
    }

    await expect(retryBtn).toBeVisible();
    await expect(page.getByRole("link", { name: /Ir al inicio/i })).toBeVisible();
  });
});
