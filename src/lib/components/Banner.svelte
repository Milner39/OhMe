<script>
    import { onMount } from "svelte"

    let text
    let textHeight = 0

    onMount(() => {
        textHeight = text.clientHeight
        window.addEventListener("resize", () => {textHeight = text.clientHeight})
    })
</script>

<div class="banner">
    <div class="bannerContent">
        <div class="icon" style="height: {textHeight}px; width: {textHeight}px;">
            <slot name="svg"/>
        </div>
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
            text-wrap: nowrap;
            white-space: nowrap;

            :global(h1) {
                font-size: 1.75rem;
                font-weight: 600;
            }
            :global(h2) {
                font-size: 1rem;
                font-weight: 500;
            }
        }
    }
</style>