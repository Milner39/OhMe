<script>
    // https://svelte.dev/docs/svelte#onmount
    // onMount: runs a function as soon as component has been mounted on the DOM
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // The html element containing banner text
    let text

    // The height of the div containing text
    let textHeight = 0

    // When component is mounted
    onMount(() => {
        // Get inital text height
        textHeight = text.clientHeight
    })
</script>

<!-- Add an event listener to update `textHeight` on resize -->
<svelte:window on:resize={() => {textHeight = text.clientHeight}}/>

<div class="banner">
    <div class="bannerContent">
        <!-- Set height and width of the icon so it matches height of `text` -->
        <div class="icon" style="height: {textHeight}px; width: {textHeight}px;">
            <!-- Children in `svg` slot go here -->
            <slot name="svg"/>
        </div>
        <!-- Bind div to `text` so it can be accesed by the script -->
        <div class="text" bind:this={text}>
            <!-- Other children go here -->
            <slot/>
        </div>
    </div>
</div>

<style lang="scss">

    .banner {
        color: var(--tx-1);
        background-color: var(--bg-1);
    }

    .bannerContent {
        max-width: var(--page-max-width);
        margin-inline: auto;

        padding: 1rem;

        display: grid;
        justify-content: start;
        grid-auto-flow: column;
        gap: 1rem;

        >.icon {
            display: flex;
            align-items: center;
            justify-content: center;

            background-color: var(--br-3);
            border-radius: 1000px;

            >:global(svg) {
                height: 60%;
                aspect-ratio: 1/1;
            }
        }

        >.text {
            display: grid;

            white-space: nowrap;
        }
    }
</style>