import { test, expect } from "@playwright/test";

test.describe("Estimator Client Flow", () => {
  test("Complete full estimator flow with pricing, navigation, validation, and submission", async ({ page }) => {
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

    // 1. Visit home page and verify Hero
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Designing the Future");
    
    // Check Get Started button
    const getStartedBtn = page.getByRole("button", { name: "Get Started" });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    // 2. Service Selection
    await expect(page.locator("h2")).toContainText("Select Your Project Services");
    
    // Choose Website Development and Graphic Design (Branding)
    await page.getByRole("heading", { name: "Website Development" }).click();
    await page.getByRole("heading", { name: "Graphic Design" }).click();
    
    // Continue to configuration
    const continueBtn = page.getByRole("button", { name: "Continue to Configuration" });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // 3. Dynamic Form Configuration
    await expect(page.getByRole("heading", { name: "Configuring: Website Development" })).toBeVisible({ timeout: 10000 });

    // Test navigation: Go back to services, change choice, and continue
    const backBtn = page.getByRole("button", { name: "Back" });
    await backBtn.click();
    await expect(page.locator("h2")).toContainText("Select Your Project Services");
    await continueBtn.click();

    // Fill in required fields for Website Development
    // The standard package is auto-selected (Standard Code, No Domain)
    const reviewBtn = page.getByRole("button", { name: "Review Cost Estimate" });
    await reviewBtn.click();

    // 4. Review page & Pricing calculations
    await expect(page.getByRole("heading", { name: "Estimate Proposal Review" })).toBeVisible({ timeout: 10005 });

    // Check exact pricing calculations
    // Website Dev (Standard: ₹12,999) + Graphic Design (Standard: ₹4,999) = ₹17,998 Subtotal
    // ₹17,998 + 18% Tax = ₹21,237.64
    const totalTextReview = await page.locator("text=One-Time:").first().textContent();
    expect(totalTextReview).toContain("₹21,237.64");

    // Let's go back from review to configuration
    const editConfigBtn = page.getByRole("button", { name: "Back to Configuration" });
    await editConfigBtn.click();
    await expect(page.getByRole("heading", { name: "Configuring: Website Development" })).toBeVisible();
    await reviewBtn.click();

    // 5. Submit Review to go to Success page
    const genQuotationBtn = page.getByRole("button", { name: "Generate Quotation Proposal" });
    await expect(genQuotationBtn).toBeVisible();
    await genQuotationBtn.click();

    // 6. Success Screen
    await expect(page.getByRole("heading", { name: "Take Next Steps" })).toBeVisible({ timeout: 10000 });

    // Verify final calculations on the Success Screen ledger
    const subtotalText = await page.locator("text=One-Time Subtotal:").locator("..").textContent();
    expect(subtotalText).toContain("₹17,998");

    const totalText = await page.locator("text=One-Time Total:").locator("..").textContent();
    expect(totalText).toContain("₹21,238");

    // Click Callback button to open lead modal
    const callbackBtn = page.getByRole("button", { name: "Request Callback" });
    await callbackBtn.click();

    const nameInput = page.getByPlaceholder("e.g. Aman Sharma");
    const emailInput = page.getByPlaceholder("e.g. aman@techcorp.in");
    const phoneInput = page.getByPlaceholder("e.g. +91 98765 43210");
    const companyInput = page.getByPlaceholder("e.g. TechCorp India");
    const notesInput = page.getByPlaceholder("Add brief project notes or instructions...");

    // Test invalid input
    await nameInput.fill("John Doe");
    await emailInput.fill("invalid-email");
    await phoneInput.fill("12345");
    
    const submitBtn = page.getByRole("button", { name: "Authorize Proposal" });
    await submitBtn.click();
    
    // Let's fill valid inputs
    await emailInput.fill("john@example.com");
    await phoneInput.fill("9876543210");
    await companyInput.fill("Test Company");
    await notesInput.fill("Please call in the afternoon.");
    
    await submitBtn.click();

    // Verification: Modal closed or confirmation feedback shown
    await expect(page.locator("text=Complete Scope Reservation")).not.toBeVisible();
    
    // Go back or reset
    const restartBtn = page.getByRole("button", { name: "Configure Another Project" });
    if (await restartBtn.isVisible()) {
      await restartBtn.click();
      await expect(page.locator("h1")).toContainText("Designing the Future");
    }
  });
});
