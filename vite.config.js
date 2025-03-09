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
