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
        <p>
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse.</p>
        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa.</p>
    </div>

    <Widget {...widgetProps} />
</div>

<style>
    h1 {
        font-weight: bold;
        font-size: 22px;
    }

    .dev-container {
        text-align: center;
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
    }

    .controls {
        margin: 20px 0;
        display: flex;
        gap: 10px;
        justify-content: space-between;
    }

    .controls button {
        padding: 8px 16px;
        background: #4a86e8;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .content {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 100px;
    }
</style>
