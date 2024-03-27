<script>
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // The html element containing banner text
    let text

    // The height of the div containing text
    let textHeight = 0

    // When component is mounted, get inital text height
    onMount(() => {
        // Use the "text" reference to access the div's height
        textHeight = text.clientHeight
    })
</script>

<!-- Add an event listener to update text height on resize -->
<svelte:window on:resize={()=>{textHeight = text.clientHeight}}/>

<div class="banner">
    <div class="bannerContent">
        <!-- Set height and width of icon so it matches height of banner text -->
        <div class="icon" style="height: {textHeight}px; width: {textHeight}px;">
            <slot name="svg"/>
        </div>
        <!-- Bind div to the "text" variable so it can be accesed in script -->
        <div class="text" bind:this={text}>
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

            text-wrap: nowrap;
            white-space: nowrap;

            :global(h1) {
                font-size: 2rem;
                font-weight: 600;
            }
            :global(h2) {
                color: var(--tx-3);
                font-size: 1rem;
                font-weight: 400;
            }
        }
    }
</style>