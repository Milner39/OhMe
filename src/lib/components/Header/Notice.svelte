<script>
    // Import svgs
    import Close from "$lib/assets/svgs/Close.svelte"
    import Alert from "$lib/assets/svgs/Alert.svelte"

    // Import components
    import AutoScroll from "$lib/components//AutoScroll.svelte"

    // Import notice store
    import { notice } from "$lib/stores/notice"
</script>

<!-- If `notice` has a value: display notice -->
{#if $notice}
    <div class="notice">
        <!-- Button to close notice -->
        <button title="Close notice" class="icon button-slim" type="button" on:click={notice.close}>
            <Close/>
        </button>
        <AutoScroll>
            <h6>{$notice}</h6>
        </AutoScroll>
        <div class="icon">
            <Alert/>
        </div>
    </div>
{/if}

<style lang="scss">
    
    .notice {
        padding: 0.5rem 1rem;

        display: grid;
        align-items: center;
        justify-content: center;
      
        grid-template-columns: 1rem 1fr 1rem;
        
        gap: 1rem;

        background-color: var(--bg-3);
        color: var(--tx-4);

        border: solid var(--bg-4);
        border-width: 1px 0 0 0;

        >.icon {
            height: 1.25rem;

            >:global(svg) {
                height: 100%;
            }
        }

        >:global(.scroller) {
            text-align: center;
        }
    }

</style>