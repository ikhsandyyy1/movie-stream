import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("should display search filters", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator(".filters")).toBeVisible();
  });

  test("should return results for valid query", async ({ page }) => {
    await page.goto("/search?q=batman");
    await expect(page.locator(".grid")).toBeVisible();
  });
});
