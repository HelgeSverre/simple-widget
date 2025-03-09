# Embeddable JavaScript Widget in Svelte, Vite, and Playwright

<a href="https://codepen.io/helgesverre/full/ByadKez"><img src="https://img.shields.io/badge/View-Widget Demo-%23FADE6A.svg?style=for-the-badge"></a>

This repository provides a step-by-step guide and working example for creating self-contained, embeddable JavaScript
widgets using Svelte.

The [example widget](https://codepen.io/helgesverre/full/ByadKez) is a simple notepad that can be added to any website
with a single script tag.

## What You'll Learn

-   How to structure a Svelte project for widget development
-   Techniques for bundling a widget into a single JavaScript file
-   Methods for persisting widget state across page loads
-   Strategies for avoiding conflicts with host pages
-   Testing approaches for embeddable components
-   Deployment and distribution best practices

## Project Structure

The repository is organized as follows:

```
.
├── src/
│   ├── Widget.svelte       # Main widget component
│   ├── styles.css          # Widget styles
│   ├── main.js             # Entry point that creates global object
│   ├── dev.js              # Development entry point
│   └── Dev.svelte          # Development harness
├── tests/                  # Tests for the widget
│   ├── pages/              # Test HTML pages
│   │   └── test.html       # Sample test page
│   └── widget.spec.js      # Playwright test script
├── vite.config.js          # Vite configuration
├── svelte.config.js        # Svelte configuration
├── playwright.config.js    # Playwright test configuration
└── package.json            # Dependencies
```

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/helgesverre/simple-widget.git
cd simple-widget

# Install dependencies
npm install

# Start development server
npm run dev
```

## Key Components Explained

### 1. The Widget Component (Widget.svelte)

This is the main Svelte component that defines our widget's UI and behavior:

```svelte
<script>
    import "./styles.css";
    import { onMount } from "svelte";
    import classNames from "classnames";

    // Widget state
    export let heading = "My Notes";
    export let open = false;
    export let position = null;

    let notes = "";
    let isInitialized = false;
    let skipTransition = true;

    onMount(() => {
        // Load saved notes
        notes = localStorage.getItem("simpleWidget.notes") || "";

        if (open === false) {
            open = localStorage.getItem("simpleWidget.open") === "true";
        }

        position =
            localStorage.getItem("simpleWidget.position") ||
            position ||
            "right";

        isInitialized = true;

        // Enable transitions after a short delay (allows initial render without animation)
        setTimeout(() => {
            skipTransition = false;
        }, 100);
    });

    // Save state when it changes
    $: if (isInitialized) {
        localStorage.setItem("simpleWidget.open", open?.toString());
        localStorage.setItem("simpleWidget.notes", notes);
        localStorage.setItem("simpleWidget.position", position);
    }
</script>

<div
    id="simple-widget-root"
    class={classNames({
        "widget-container": true,
        "right": position === "right",
        "left": position === "left",
        "open": open,
        "closed": !open,
        "no-transition": skipTransition,
    })}
>
    <div class="widget-panel">
        <button class="widget-tab" on:click={() => (open = !open)}>
            <span class="tab-icon">
                {#if position === "right"}
                    {open ? "›" : "‹"}
                {:else}
                    {!open ? "›" : "‹"}
                {/if}
            </span>
        </button>

        <div id="simple-widget">
            <div class="widget-header">
                <h1>{heading}</h1>
            </div>

            <div class="widget-content">
                <textarea
                    bind:value={notes}
                    placeholder="Type your notes here..."
                ></textarea>
            </div>
        </div>
    </div>
</div>
```

### 2. CSS Isolation (styles.css)

The styling is carefully structured to avoid conflicts with host pages:

```css
/* Base container */
#simple-widget-root {
    position: fixed;
    z-index: 9000;
    top: 0;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, sans-serif;
    display: flex;
}

/* Positioning */
#simple-widget-root.right {
    right: 0;
}

#simple-widget-root.left {
    left: 0;
}

/* ...more styles... */
```

See [styles.css](src/styles.css) for the full stylesheet.

### 3. Global Entry Point (main.js)

This file creates the global API that websites will use to interact with the widget:

```javascript
import Widget from "./Widget.svelte";

// Define global object with API
const SimpleWidget = {
    config: {},

    // Method to initialize the widget
    init: function (target, props = {}) {
        // Merge default config with props
        const mergedProps = { ...SimpleWidget.config, ...props };

        return new Widget({
            target: target || document.body,
            props: mergedProps,
        });
    },

    // Parse data attributes from script tag
    parseDataAttributes: function (dataset) {
        const config = {};
        for (const key in dataset) {
            let value = dataset[key];

            // Convert strings to appropriate types
            if (value === "true") value = true;
            if (value === "false") value = false;
            if (!isNaN(value) && value.trim() !== "") value = Number(value);

            config[key] = value;
        }
        return config;
    },
};

// Read config from script tag
SimpleWidget.config = {
    open: false,
    position: "right",
    autoInit: false,
    ...SimpleWidget.parseDataAttributes(document.currentScript?.dataset || {}),
};

// Auto-initialize if configured
if (SimpleWidget.config.autoInit) {
    SimpleWidget.init(document.body, SimpleWidget.config);
}

// Make available globally
window.SimpleWidget = SimpleWidget;
```

### 4. Build Configuration (vite.config.js)

The Vite configuration is crucial for bundling everything into a single embeddable file:

```javascript
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                legacy: false,
            },
        }),

        // This plugin injects CSS into JS instead of creating separate files
        cssInjectedByJsPlugin({
            styleId: "simple-widget-styles",
            useStrictCSP: false,
            topExecutionPriority: true,
        }),
    ],

    // The critical configuration for embedding
    build: {
        lib: {
            entry: "src/main.js", // Entry point
            name: "SimpleWidget", // Global variable name
            formats: ["iife"], // Use IIFE for script tag compatibility
            fileName: () => "widget.js", // Output filename
        },
    },
});
```

## Development Environment

### Development Harness (Dev.svelte)

This component makes it easy to test the widget during development:

```svelte
<script>
    import Widget from "./Widget.svelte";

    let widgetProps = {};

    // Create a new instance with updated props
    function updateWidget(newProps) {
        widgetProps = { ...widgetProps, ...newProps };
    }
</script>

<div class="dev-container">
    <h1>SimpleWidget Development</h1>
    <p>This page allows you to test the notepad widget during development.</p>

    <div class="controls">
        <button on:click={() => updateWidget({ position: "left" })}>
            ← Left
        </button>
        <button on:click={() => updateWidget({ open: !widgetProps.open })}>
            {widgetProps.open ? "Close " : "Open "}
        </button>
        <button on:click={() => updateWidget({ position: "right" })}>
            Right →
        </button>
    </div>

    <div class="content">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <!-- More content... -->
    </div>

    <Widget {...widgetProps} />
</div>
```

## Testing with Playwright

The repository includes automated tests using Playwright:

```javascript
test("widget should persist notes when i reload", async ({ page }) => {
    await loadTestPage(page, "pages/test.html");

    await page.waitForSelector(".widget-tab");

    await page.locator(".widget-tab").click();

    await page.locator("textarea").fill("This is a test note");

    await page.waitForTimeout(500);

    await page.reload();

    await page.waitForSelector(".widget-tab");

    await page.locator(".widget-tab").click();

    await expect(page.locator("textarea")).toHaveValue("This is a test note");
});
```

## Embedding the Widget

After building, the widget can be embedded on any website with a single script tag:

```html
<!-- Basic usage -->
<script src="path/to/widget.js" defer></script>
<script>
    document.addEventListener("DOMContentLoaded", function () {
        SimpleWidget.init();
    });
</script>

<!-- With auto-initialization -->
<script
    src="path/to/widget.js"
    data-heading="Quick Notes"
    data-position="left"
    data-auto-init="true"
    defer
></script>
```

## Key Techniques

### The IIFE Pattern

The widget is compiled as an IIFE (Immediately Invoked Function Expression):

```javascript
(function () {
    // All widget code is contained here
    // No global variables except the explicit API
    window.SimpleWidget = {
        /* API */
    };
})();
```

This pattern:

-   Isolates the widget code from the host page
-   Prevents variable name collisions
-   Keeps implementation details private
-   Exposes only the intended API

### CSS Isolation

All styles use specific selectors to avoid affecting the host page:

```css
#simple-widget-root .widget-panel {
    /* styles */
}
```

### State Persistence

The widget uses localStorage to persist state across page loads:

```javascript
// Save state
localStorage.setItem("simpleWidget.notes", notes);

// Load state
notes = localStorage.getItem("simpleWidget.notes") || "";
```

## Building and Deployment

To build the widget for production:

```bash
npm run build
```

This generates a single file in `dist/widget.js` that can be hosted anywhere:

1. On your own server
2. In a CDN like Unpkg or jsDelivr
3. Directly in your version control (for small projects)

## Best Practices

When creating your own embeddable widgets:

1. **Namespace everything** - Use unique IDs and class prefixes
2. **Keep dependencies internal** - Don't rely on external libraries
3. **Graceful degradation** - Handle errors without affecting the host page
4. **Size matters** - Keep your bundle as small as possible
5. **Avoid global pollution** - Only expose what's necessary
6. **Provide a clean API** - Make it easy for developers to use your widget
7. **Test thoroughly** - Ensure compatibility with different sites

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions to improve this tutorial are welcome! Please feel free to submit a Pull Request.
