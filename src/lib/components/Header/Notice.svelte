<script>
    // Import svgs
    import Close from "$lib/assets/svgs/Close.svelte"

    // Import components
    import AutoScroll from "$lib/components//AutoScroll.svelte"

    // Variable indicating notice state
    let show = true

    // Define function to close notice
    const close = () => {
        show = false
    }
</script>

{#if show}
    <div class="notice">
        <!-- Button to close notice -->
        <button title="close notice" class="button-slim" type="button" on:click={close}><Close/></button>
        <AutoScroll>
            <slot/>
        </AutoScroll>
    </div>
{/if}

<style lang="scss">
    
    .notice {
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;

        display: flex;
        align-items: center;

        background-color: var(--bg-3);
        color: var(--tx-4);

        border: solid var(--bg-4);
        border-width: 1px 0 0 0;

        >button {
            margin-right: 0.75rem;
            height: 1rem;

            >:global(svg) {
                height: 100%;
            }
        }
    }

</style>