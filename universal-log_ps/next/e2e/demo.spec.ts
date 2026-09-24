import { expect, test } from "@playwright/test";

test("live demo automatically showcases the pipeline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Every log.*One language/i })).toBeVisible();
  await page.getByRole("link", { name: /watch live demo/i }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("heading", { name: /Watch one log become actionable/i })).toBeVisible();
  await expect(page.getByText(/OCSF 1.9 record/i)).toBeVisible();
  await expect(page.getByText(/Integrity verified/i)).toBeVisible({ timeout: 15_000 });
});

test("parser lab uploads and verifies exact evidence", async ({ page }) => {
  await page.goto("/lab");
  const fileChooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /drop a log file here/i }).click();
  await (await fileChooser).setFiles("public/samples/palo-alto-cef.log");
  await expect(page.getByText(/CEF · 99%/i)).toBeVisible({ timeout: 10_000 });
  await page.getByRole("tab", { name: "integrity" }).click();
  await page.getByRole("button", { name: /verify evidence/i }).click();
  await expect(page.getByText(/evidence verified/i)).toBeVisible();
});

test("mobile navigation reaches every module", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Live demo", "Parser lab", "Events", "Sources", "Schema"]) {
    await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: label, exact: true }).click();
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
  await expect(page.locator(".event-list .panel-head").getByText(/records/i)).toBeVisible();
  await page.getByRole("textbox", { name: /search evidence/i }).fill("SMB");
  await expect(page.getByRole("button", { name: /Possible SMB exploit attempt/i })).toBeVisible();
});
