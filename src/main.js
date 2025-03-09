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
