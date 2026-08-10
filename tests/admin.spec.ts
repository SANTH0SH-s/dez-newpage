import { test, expect } from "@playwright/test";

test.describe("Admin CMS Management", () => {
  test("Invalid admin login and then successful login followed by CRUD operations", async ({ page }) => {
    // Enable hydration error detection
    page.on("console", msg => {
      const text = msg.text();
      if (msg.type() === "error" && (text.includes("hydration") || text.includes("Hydration failed") || text.includes("server rendered HTML"))) {
        throw new Error(`React hydration error detected: ${text}`);
      }
    });

    page.on("pageerror", err => {
      if (err.message.includes("hydration") || err.message.includes("Hydration failed") || err.message.includes("server rendered HTML")) {
        throw new Error(`React hydration error detected: ${err.message}`);
      }
    });

    // 1. Invalid Login Test
    await page.goto("/admin/login");
    await expect(page.locator("h3")).toContainText("ADMIN PORTAL");

    const emailInput = page.locator("input[type='email']");
    const passwordInput = page.locator("input[type='password']");
    const signInBtn = page.getByRole("button", { name: "Sign In" });

    await emailInput.fill("invalid@dezprox.com");
    await passwordInput.fill("wrongpassword");
    await signInBtn.click();

    await expect(page.locator("text=Invalid administrative credentials. Access Denied.")).toBeVisible();

    // 2. Successful Login
    await emailInput.fill("admin@dezprox.com");
    await passwordInput.fill("admin123");
    await signInBtn.click();

    // Verify redirected to Dashboard
    await page.waitForURL("/admin");
    // Reload the page to ensure the layout loads the active session state cleanly
    await page.reload();
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible({ timeout: 15000 });

    // 3. Test Navigation and CRUD on Services
    await page.click("text=Services");
    await page.waitForURL("/admin/services");
    await expect(page.getByRole("heading", { name: "Service Management" })).toBeVisible();

    // Create Service
    await page.click("text=Add Service");
    await page.locator("input[placeholder='e.g. Cybersecurity Audits']").fill("E2E Test Service");
    await page.locator("input[type='number']").fill("4500");
    await page.click("text=Save Changes");

    // View / Verify Succeeded
    await expect(page.locator("text=E2E Test Service")).toBeVisible();

    // Edit Service
    await page.locator("button[title='Edit Service']").last().click();
    await page.locator("input[placeholder='e.g. Cybersecurity Audits']").fill("E2E Test Service Updated");
    await page.click("text=Save Changes");

    // Verify Save Succeeded
    await expect(page.locator("text=E2E Test Service Updated")).toBeVisible();

    // Refresh and verify persistence
    await page.reload();
    await expect(page.locator("text=E2E Test Service Updated")).toBeVisible();

    // Delete Service
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("button[title='Delete Service']").last().click();
    await expect(page.locator("text=E2E Test Service Updated")).not.toBeVisible();

    // 4. Test Navigation and CRUD on Packages
    await page.click("text=Packages");
    await page.waitForURL("/admin/packages");
    await expect(page.getByRole("heading", { name: "Package Builder" })).toBeVisible();

    // Create Package
    await page.click("text=Add Package");
    await page.locator("input[placeholder='e.g. Standard']").fill("E2E Test Package");
    await page.locator("input[type='number']").first().fill("15000");
    await page.locator("input[placeholder='e.g. 2-3 weeks, Monthly']").fill("3 Weeks");
    await page.locator("textarea[placeholder='Provide a quick overview...']").fill("Test package description");
    await page.click("text=Save Package");

    // View / Verify Succeeded
    await expect(page.locator("text=E2E Test Package")).toBeVisible();

    // Edit Package
    await page.locator("button[title='Edit Package']").last().click();
    await page.locator("input[placeholder='e.g. Standard']").fill("E2E Test Package Updated");
    await page.click("text=Save Package");

    // Verify Succeeded
    await expect(page.locator("text=E2E Test Package Updated")).toBeVisible();

    // Refresh and check persistence
    await page.reload();
    await expect(page.locator("text=E2E Test Package Updated")).toBeVisible();

    // Delete Package
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("button[title='Delete Package']").last().click();
    await expect(page.locator("text=E2E Test Package Updated")).not.toBeVisible();

    // 5. Test Questionnaire
    await page.click("text=Questionnaire");
    await page.waitForURL("/admin/questions");
    await expect(page.getByRole("heading", { name: "Questionnaire CMS Builder" })).toBeVisible();

    // Create Question
    await page.click("text=Add Question");
    await page.locator("input[placeholder='e.g. Need domain setup?']").fill("E2E Test Question");
    await page.click("text=Save Question");

    // View / Verify Succeeded
    await expect(page.locator("text=E2E Test Question")).toBeVisible();

    // Edit Question
    await page.locator("button[title='Edit Question']").last().click();
    await page.locator("input[placeholder='e.g. Need domain setup?']").fill("E2E Test Question Updated");
    await page.click("text=Save Question");

    // Verify Succeeded
    await expect(page.locator("text=E2E Test Question Updated")).toBeVisible();

    // Delete Question
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("button[title='Delete Question']").last().click();
    await expect(page.locator("text=E2E Test Question Updated")).not.toBeVisible();

    // 6. Test Add-ons
    await page.click("text=Add-ons");
    await page.waitForURL("/admin/addons");
    await expect(page.getByRole("heading", { name: "Add-on Management" })).toBeVisible();

    // Create Add-on
    await page.getByRole("button", { name: "Create Add-on" }).click();
    await page.locator("input[placeholder='e.g. WhatsApp Integration Gateway']").fill("E2E Test Addon");
    await page.locator("input[type='number']").first().fill("2500");
    await page.locator("input[placeholder='e.g. WhatsApp Integration Gateway']").focus();
    await page.keyboard.press("Enter");

    // View / Verify Succeeded
    await expect(page.locator("text=E2E Test Addon")).toBeVisible();

    // Edit Add-on
    await page.locator("button[title='Edit Add-on']").last().click();
    await page.locator("input[placeholder='e.g. WhatsApp Integration Gateway']").fill("E2E Test Addon Updated");
    await page.locator("input[placeholder='e.g. WhatsApp Integration Gateway']").focus();
    await page.keyboard.press("Enter");

    // Verify Succeeded
    await expect(page.locator("text=E2E Test Addon Updated")).toBeVisible();

    // Delete Add-on
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("button[title='Delete Add-on']").last().click();
    await expect(page.locator("text=E2E Test Addon Updated")).not.toBeVisible();

    // 7. Test Multipliers
    await page.click("text=Multiplier Set");
    await page.waitForURL("/admin/multipliers");
    await expect(page.getByRole("heading", { name: "Multiplier Management" })).toBeVisible();

    // Modify a multiplier value
    const multiplierInput = page.locator("input[type='number']").first();
    const originalVal = await multiplierInput.inputValue();
    await multiplierInput.fill("1.45");
    await page.click("text=Update Coefficients");
    await expect(page.locator("text=Coefficients Updated successfully!")).toBeVisible();

    // Verify it persists on refresh
    await page.reload();
    await expect(multiplierInput).toHaveValue("1.45");

    // Restore original value
    await multiplierInput.fill(originalVal);
    await page.click("text=Update Coefficients");
    await expect(page.locator("text=Coefficients Updated successfully!")).toBeVisible();

    // 8. Test Estimates & Enquiries
    await page.click("text=Estimates");
    await page.waitForURL("/admin/estimates");
    await expect(page.getByRole("heading", { name: "Estimate Slips Management" })).toBeVisible();

    // 9. Test Reports & Settings
    await page.click("text=Reports");
    await page.waitForURL("/admin/reports");
    await expect(page.getByRole("heading", { name: "System Reports & Analytics" })).toBeVisible();

    await page.click("text=Settings");
    await page.waitForURL("/admin/settings");
    await expect(page.getByRole("heading", { name: "Global Settings" })).toBeVisible();
  });
});
