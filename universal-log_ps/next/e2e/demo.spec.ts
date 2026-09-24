import { expect, test } from "@playwright/test";

test("jury flow normalizes and verifies evidence", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "One event language." })).toBeVisible();
  await page.getByRole("link", { name: /run live demo/i }).click();
  await page.getByRole("button", { name: /normalize event/i }).click();
  await expect(page.getByText(/CEF \/ 99% CONF/)).toBeVisible();
  await page.getByRole("tab", { name: "integrity" }).click();
  await page.getByRole("button", { name: /verify evidence/i }).click();
  await expect(page.getByText(/evidence verified/i)).toBeVisible();
});

test("mobile navigation reaches every module", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Parser Lab", "Events", "Sources", "Schema"]) {
    await page.getByRole("link", { name: label }).click();
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("config-only source onboarding validates and persists", async ({ page }) => {
  await page.goto("/sources");
  await page.getByRole("button", { name: /continue to extract/i }).click();
  await page.getByRole("button", { name: /continue to map/i }).click();
  await page.getByRole("button", { name: /validate \+ preview/i }).click();
  await expect(page.getByRole("heading", { name: "Manifest accepted." })).toBeVisible();
  await page.getByRole("button", { name: /save locally/i }).click();
  await expect(page.locator(".source-card code", { hasText: "custom.edge-gateway" })).toBeVisible();
});

test("event explorer loads and filters the demo corpus", async ({ page }) => {
  await page.goto("/events");
  await page.getByRole("button", { name: /load demo data/i }).click();
  await expect(page.getByText(/RECORDS/).first()).toBeVisible();
  await page.getByRole("textbox", { name: /search evidence/i }).fill("SMB");
  await expect(page.getByRole("button", { name: /Possible SMB exploit attempt/i })).toBeVisible();
});
