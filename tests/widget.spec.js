import { expect, test } from "@playwright/test";

// This test is just an arbitrary example file to demonstrate the testing of the SimpleWidget component in banal scenarios.

function loadTestPage(page, file) {
    return page.goto("file://" + new URL(file, import.meta.url).pathname);
}

test("Notepad widget functions correctly", async ({ page }) => {
    // Navigate to the test page
    await loadTestPage(page, "pages/test.html");

    // Wait for widget to initialize
    await page.waitForSelector(".widget-tab");

    // Open the widget by clicking the tab
    await page.locator(".widget-tab").click();

    // Check if widget is open
    const widget = page.locator("#simple-widget");
    await expect(widget).toBeVisible();

    // Type some notes
    const textarea = page.locator("textarea");
    await textarea.fill("This is a test note");

    // Wait a bit to ensure localStorage is updated
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();

    // Wait for widget to initialize again
    await page.waitForSelector(".widget-tab");

    // Open the widget again
    await page.locator(".widget-tab").click();

    // Verify notes still exist
    const savedTextarea = page.locator("textarea");
    await expect(savedTextarea).toHaveValue("This is a test note");
});

test("should persist my notes when i reload", async ({ page }) => {
    await loadTestPage(page, "pages/test.html");

    await page.waitForSelector(".widget-tab");

    await page.locator(".widget-tab").click();

    await page.locator("textarea").fill("This is a test note");

    await page.waitForTimeout(500);

    await page.reload();

    await page.waitForSelector(".widget-tab");

    await page.locator(".widget-tab").click();

    await expect(page.locator("textarea")).toHaveValue("This is a test note");

    await page.locator("textarea").fill("This is a new note");

    await page.waitForTimeout(500);

    await page.reload();

    await page.waitForSelector(".widget-tab");

    await page.locator(".widget-tab").click();

    await expect(page.locator("textarea")).toHaveValue("This is a new note");
});

test("widget open state should persist after reload", async ({ page }) => {
    await loadTestPage(page, "pages/test.html");
    await page.waitForSelector(".widget-tab");

    // Widget should be closed by default
    await expect(page.locator(".widget-container")).toHaveClass(/closed/);

    // Open the widget
    await page.locator(".widget-tab").click();
    await expect(page.locator(".widget-container")).toHaveClass(/open/);

    // Reload and check if it's still open
    await page.reload();
    await page.waitForSelector(".widget-tab");
    await expect(page.locator(".widget-container")).toHaveClass(/open/);

    // Close the widget
    await page.locator(".widget-tab").click();
    await expect(page.locator(".widget-container")).toHaveClass(/closed/);

    // Reload and check if it's still closed
    await page.reload();
    await page.waitForSelector(".widget-tab");
    await expect(page.locator(".widget-container")).toHaveClass(/closed/);
});

test("widget should handle large text inputs properly", async ({ page }) => {
    await loadTestPage(page, "pages/test.html");
    await page.waitForSelector(".widget-tab");
    await page.locator(".widget-tab").click();

    // Generate a large text input (10 paragraphs of lorem ipsum)
    const longText = Array(10)
        .fill(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        )
        .join("\n\n");

    // Type the long text
    await page.locator("textarea").fill(longText);

    // Wait for localStorage update
    await page.waitForTimeout(500);

    // Reload and verify
    await page.reload();
    await page.waitForSelector(".widget-tab");
    await page.locator(".widget-tab").click();

    // Verify the long text was saved
    await expect(page.locator("textarea")).toHaveValue(longText);
});

test("widget should clear notes when localStorage is cleared", async ({
    page,
}) => {
    await loadTestPage(page, "pages/test.html");
    await page.waitForSelector(".widget-tab");
    await page.locator(".widget-tab").click();

    // Add some text
    await page.locator("textarea").fill("This text will be cleared");

    // Wait for localStorage update
    await page.waitForTimeout(500);

    // Clear localStorage
    await page.evaluate(() => {
        localStorage.clear();
    });

    // Reload page
    await page.reload();
    await page.waitForSelector(".widget-tab");
    await page.locator(".widget-tab").click();

    // Verify textarea is empty
    await expect(page.locator("textarea")).toHaveValue("");
});

test("widget should handle programmatic initialization with custom heading", async ({
    page,
}) => {
    // Load the page
    await loadTestPage(page, "pages/test.html");

    // Overwrite initialization with custom heading
    await page.evaluate(() => {
        // First clear any existing initialization
        const existingRoot = document.getElementById("simple-widget-root");
        if (existingRoot) existingRoot.remove();

        // Initialize with custom heading
        SimpleWidget.init(document.body, { heading: "Custom Notes Title" });
    });

    // Wait for widget to initialize
    await page.waitForSelector(".widget-tab");

    // Open widget
    await page.locator(".widget-tab").click();

    // Verify custom heading
    await expect(page.locator(".widget-header h1")).toHaveText(
        "Custom Notes Title",
    );
});

test("widget should correctly focus the textarea when opened", async ({
    page,
}) => {
    await loadTestPage(page, "pages/test.html");
    await page.waitForSelector(".widget-tab");

    // Open the widget
    await page.locator(".widget-tab").click();

    // Click on the textarea to focus it
    await page.locator("textarea").click();

    // Type without explicit focus operation
    await page.keyboard.type("This text should appear in the textarea");

    // Verify the text was typed into the textarea
    await expect(page.locator("textarea")).toHaveValue(
        "This text should appear in the textarea",
    );
});

test("widget should toggle open/closed with repeated tab clicks", async ({
    page,
}) => {
    await loadTestPage(page, "pages/test.html");
    await page.waitForSelector(".widget-tab");

    // Initially closed
    await expect(page.locator(".widget-container")).toHaveClass(/closed/);

    // Open widget
    await page.locator(".widget-tab").click();
    await expect(page.locator(".widget-container")).toHaveClass(/open/);

    // Close widget
    await page.locator(".widget-tab").click();
    await expect(page.locator(".widget-container")).toHaveClass(/closed/);

    // Open widget again
    await page.locator(".widget-tab").click();
    await expect(page.locator(".widget-container")).toHaveClass(/open/);

    // Close widget again
    await page.locator(".widget-tab").click();
    await expect(page.locator(".widget-container")).toHaveClass(/closed/);
});
