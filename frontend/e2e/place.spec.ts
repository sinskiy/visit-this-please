import { expect, Page, test } from "@playwright/test";
import { generateString } from "./utils";

test.describe.configure({ mode: "serial" });

let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test("can create a place", async () => {
  // create user
  await page.goto("/");

  await page.getByRole("link", { name: /sign/ }).click();

  await page.waitForURL(/sign/);

  const randomUsername = generateString(100);
  await page.getByLabel("username").fill(randomUsername);
  await page.getByLabel("password", { exact: true }).fill("123");
  await page.getByLabel("confirm password").fill("123");

  await page.locator("[type=submit]").click();

  await page.waitForURL("/");

  await page.getByRole("button", { name: /add place/ }).click();

  const dialog = page.locator("dialog[open]");
  await dialog.getByLabel("country*").fill("Russia");
  await dialog.getByRole("button", { name: "Russia" }).click();
  await dialog.getByLabel(/a state/).check();
  await dialog.getByLabel(/a settlement/).check();
  await dialog.getByLabel(/omit name/).check();

  const button = dialog.getByRole("button", { name: "submit" });

  expect(button).not.toBeDisabled();

  await button.click();

  expect(page.getByRole("heading", { name: "Russia" }));
});

test("can go to created place", async () => {
  await page.locator(':text("Russia") + a').nth(1).click();

  expect(page.url()).toMatch(/\/\w+$/);
});

test("can add comment", async () => {
  await page.getByLabel("comment").fill("test-comment");

  expect(page.getByText("test-comment")).toBeInViewport();
});
