import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display featured carousel", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".hero")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("should display title rails", async ({ page }) => {
    await page.goto("/");
    const rails = page.locator(".section");
    await expect(rails.first()).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/movies"]');
    await expect(page).toHaveURL(/\/movies/);
  });
});
