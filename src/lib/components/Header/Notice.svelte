<script>
    // Import svgs
    import Close from "$lib/assets/svgs/Close.svelte"

    // Import components
    import AutoScroll from "$lib/components//AutoScroll.svelte"

    // Import notice store
    import { notice } from "$lib/stores/notice"
</script>

<!-- If `notice` has a value: display notice -->
{#if $notice}
    <div class="notice">
        <!-- Button to close notice -->
        <button title="Close notice" class="button-slim" type="button" on:click={notice.close}><Close/></button>
        <AutoScroll>
            <h6>{$notice}</h6>
        </AutoScroll>
    </div>
{/if}

<style lang="scss">
    
    .notice {
        padding: 0 0.75rem;
        padding-top: 0.75rem;
        padding-bottom: 0.75rem;

        display: grid;
        align-items: center;
        justify-content: center;
      
        grid-template-columns: 1rem 1fr;
        // To center notice use:
        // grid-template-columns: 1rem 1fr 1rem;
        // need to add something like a decorative svg for an even UI
        
        gap: 1rem;

        background-color: var(--bg-3);
        color: var(--tx-4);

        border: solid var(--bg-4);
        border-width: 1px 0 0 0;

        >button {
            height: 1rem;

            >:global(svg) {
                height: 100%;
            }
        }

        >:global(.scroller) {
            text-align: center;
        }
    }

</style>