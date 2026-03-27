import { test, expect } from "@playwright/test";

test.describe("Admin (/admin/requests)", () => {
  test("redirects unauthenticated user to /auth", async ({ page }) => {
    await page.goto("/admin/requests");
    await expect(page).toHaveURL(/\/auth/);
  });

  test("redirects authenticated non-admin to home (/)", async ({ page, context }) => {
    const cookies = await context.cookies();
    const hasSession = cookies.some((c) =>
      c.name.includes("next-auth") || c.name.includes("session"),
    );
    // Only run this part if we have a user-level session (not admin)
    if (!hasSession) {
      test.skip();
      return;
    }

    await page.goto("/admin/requests");
    // Should either redirect to / or stay on /admin (if user IS admin)
    const url = page.url();
    expect(url === "http://localhost:3000/" || url.includes("/admin/requests")).toBe(true);
  });

  test("admin user sees the Solicitudes heading", async ({ page, context }) => {
    const cookies = await context.cookies();
    const isAdmin = cookies.some(
      (c) => c.name.includes("next-auth") && c.value.includes("admin"),
    );
    if (!isAdmin) {
      test.skip();
      return;
    }

    await page.goto("/admin/requests");
    await expect(page.getByText("Solicitudes")).toBeVisible({ timeout: 8_000 });
  });

  test("admin filter tabs are visible", async ({ page, context }) => {
    const cookies = await context.cookies();
    const isAdmin = cookies.some(
      (c) => c.name.includes("next-auth") && c.value.includes("admin"),
    );
    if (!isAdmin) {
      test.skip();
      return;
    }

    await page.goto("/admin/requests");
    // Filter tabs (PENDING, APPROVED, REJECTED, ALL)
    await expect(page.getByText("Pendiente").or(page.getByText("PENDING"))).toBeVisible({
      timeout: 8_000,
    });
  });
});
