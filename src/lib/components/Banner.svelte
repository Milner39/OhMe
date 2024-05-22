<script>
    // The height of the div containing text
    let textHeight = 0
</script>

<div class="banner">
    <div class="bannerContent">
        <!-- Set height and width of the icon so it matches height of `text` -->
        <div class="icon" style="height: {textHeight}px; width: {textHeight}px;">
            <!-- Children in `svg` slot go here -->
            <slot name="svg"/>
        </div>
        <!-- Bind div's clientHeight to `textHeight` so it can be accesed by the script -->
        <div class="text" bind:clientHeight={textHeight}>
            <!-- Other children go here -->
            <slot/>
        </div>
    </div>
</div>

<style lang="scss">

    .banner {
        color: var(--tx-1);
        background-color: var(--bg-1);
        padding: 1rem;
    }

    .bannerContent {
        max-width: var(--page-max-width);
        margin-inline: auto;

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