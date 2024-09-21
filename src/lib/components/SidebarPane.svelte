<script>
    // #region Imports

    /*
       https://svelte.dev/docs/svelte#onmount
       Subroutine that runs when the component is mounted
    */
    import { onMount } from "svelte"
    // #endregion



    /*
        Get `sideItemCount` prop from parent 
        to indicate how many panes there are.
    */
    export let sideItemCount = 0

    /*
        Get `selectedPane` prop from parent
        to indicate what pane is selected.
    */
    export let selectedPane = 0


    /** @type {HTMLElement} - The HTML element that contains the pane content. */
    let pane

    // `boolean` indicating if a scroll bar on `pane` is shown
    let paneScrollBar = false



    // Define subroutine to be ran on mount and resize
    const onResize = () => {
        // Set `paneScrollBar` to `true` if a scrollbar is shown
        paneScrollBar = pane.clientHeight < pane.scrollHeight
    }

    // When component is mounted
    onMount(() => {
        // Create a resize observer
        const resizeObserver = new ResizeObserver(_ => {
            onResize()
        })

        // Observe the `pane`
        resizeObserver.observe(pane)

        // When component is unmounted
        return () => {
            // Stop observing
            resizeObserver.disconnect()
        }
    })
</script>

<div class="sidebarPane">
    <ul class="sidebar">
        <!-- Create a sidebar item `sideItemCount` times -->
        {#each Array(sideItemCount) as _, i}
            <li class="sidebarItem" class:active={selectedPane === i}>
                <button on:click={() => {selectedPane = i}}>
                    <slot name="sidebar" index={i}/>
                </button>
            </li>
        {/each}
    </ul>
    <!-- Bind div to `pane` so it can be accessed by the script -->
    <div class="pane" bind:this={pane} class:pullScrollBar={paneScrollBar}>
        <slot/>
    </div>
</div>

<style lang="scss">

    .sidebarPane {
        height: 100%;
        overflow: hidden;

        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto 1fr;
    }

    .sidebar {
        display: flex;
        flex-direction: column;

        border: solid var(--bg-4);
        border-width: 0 1px 0 0;

        overflow-y: auto;
        overflow-x: hidden;
        
        >.sidebarItem {
            transition: color 200ms ease-in-out;
            &.active {
                color: var(--br-3);
            }

            >button {
                width: 100%;
            
                padding: 1rem;

                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;

                white-space: nowrap;

                transition: background-color 200ms ease-in-out;
                &:hover {
                    background-color: var(--bg-4);
                }

                :global(svg) {
                    height: 1.25em;
                }   
            }
        }

        &::-webkit-scrollbar {
            width: 2.5rem;
        }
        &::-webkit-scrollbar-track {
            background-color: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background-color: var(--bg-4);
            border-radius: 1000px;
            border: 1rem solid var(--bg-3);
        }
    }

    .pane {
        padding: 1rem;

        display: flex;
        flex-direction: column;
        gap: 1rem;

        overflow-y: auto;

        &.pullScrollBar {
            padding-right: 0;
        }

        &::-webkit-scrollbar {
            width: 2.5rem;
        }
        &::-webkit-scrollbar-track {
            background-color: transparent;
        }
        &::-webkit-scrollbar-thumb {
            background-color: var(--bg-4);
            border-radius: 1000px;
            border: 1rem solid var(--bg-3);
        }
    }

</style>