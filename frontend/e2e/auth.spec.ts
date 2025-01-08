import { test, expect, Page } from "@playwright/test";
import { generateString } from "./utils";

test.describe.configure({ mode: "serial" });

let randomUsername: string;
let page: Page;

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
});

test("can sign up", async () => {
  await page.goto("/");

  await page.getByRole("link", { name: /sign/ }).click();

  await page.waitForURL(/sign/);

  randomUsername = generateString(100);
  await page.getByLabel("username").fill(randomUsername);
  await page.getByLabel("password", { exact: true }).fill("123");
  await page.getByLabel("confirm password").fill("123");

  await page.locator("[type=submit]").click();

  await page.waitForURL("/");

  expect(page.url()).toMatch(/\/$/);
});

test("can log out", async () => {
  await page.getByRole("button", { name: /out/i }).click();

  await expect(page.getByRole("link", { name: /log/i })).toBeInViewport();

  expect(page.url()).toMatch(/\/$/);
});

test("can log out and log in", async () => {
  await page.getByRole("link", { name: /log/i }).click();

  await page.waitForURL(/log/i);

  await page.getByLabel("username").fill(randomUsername);
  await page.getByLabel("password").fill("123");

  await page.locator("[type=submit]").click();

  await page.waitForURL("/");
  expect(page.url()).toMatch(/\/$/);
});
