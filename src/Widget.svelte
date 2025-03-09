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
