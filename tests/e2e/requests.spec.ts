import { test, expect } from "@playwright/test";

test.describe("Requests (/requests)", () => {
  test("redirects to /auth when not authenticated", async ({ page }) => {
    await page.goto("/requests");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("authenticated user sees the Mis solicitudes heading", async ({ page, context }) => {
    const cookies = await context.cookies();
    const hasSession = cookies.some((c) =>
      c.name.includes("next-auth") || c.name.includes("session"),
    );
    if (!hasSession) {
      test.skip();
      return;
    }

    await page.goto("/requests");
    await expect(page.getByText("Mis solicitudes")).toBeVisible({ timeout: 8_000 });
  });

  test("'Nueva Solicitud' link is visible on the requests page (authenticated)", async ({
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

    await page.goto("/requests");
    await expect(page.getByText("Nueva Solicitud")).toBeVisible({ timeout: 8_000 });
  });
});

test.describe("Spot create (/spot/create)", () => {
  test("redirects to /auth when not authenticated", async ({ page }) => {
    await page.goto("/spot/create");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("authenticated user can access /spot/create", async ({ page, context }) => {
    const cookies = await context.cookies();
    const hasSession = cookies.some((c) =>
      c.name.includes("next-auth") || c.name.includes("session"),
    );
    if (!hasSession) {
      test.skip();
      return;
    }

    await page.goto("/spot/create");
    await expect(page).not.toHaveURL(/\/auth/);
  });
});
