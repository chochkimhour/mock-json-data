import { expect, test } from "@playwright/test";

test("homepage loads and exposes the main actions", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Mock JSON Data/i);
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Create a Mock API/i }),
  ).toBeVisible();
});
