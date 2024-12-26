import { test, expect } from "@playwright/test";

test("can sign up", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: /sign/ }).click();

  const randomUsername = generateString(100);
  await page.getByLabel("username").fill(randomUsername);
  await page.getByLabel("password", { exact: true }).fill("123");
  await page.getByLabel("confirm password").fill("123");

  await page.locator("[type=submit]").click();

  await page.waitForURL("/");
  expect(page.url()).toMatch(/\/$/);
});

function generateString(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
