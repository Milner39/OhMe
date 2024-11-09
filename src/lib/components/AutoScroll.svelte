<script>
    // #region Imports

    /*
       https://svelte.dev/docs/svelte#onmount
       Subroutine that runs when the component is mounted
    */
    import { onMount } from "svelte"
    // #endregion



    /** @type {HTMLElement} - The HTML element that will scroll. */
    let scroller

    // The scroll position in px
    let scroll = 0


    // Define subroutine to scroll across div
    const scrollRight = async () => {
        // Check if `scroller` is at starting position: Wait 3000ms
        if (scroll === 0) await new Promise(resolve => setTimeout(resolve, 3000))

        // Increment scroll position
        scroll += 1

        // Check if `scroller` has been unmounted
        if (!scroller) return

        // Scroll to new position
        scroller.scrollTo({ left: scroll, behavior: "smooth" })

        // If scroll position is larger than the maximum scroll distance
        if (scroll > scroller.scrollWidth - scroller.clientWidth) {
            // Wait 3000ms
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Check if `scroller` has been unmounted
            if (!scroller) return

            // Reset scroll position
            scroller.scrollLeft = 0
            scroll = 0
        }
        // Wait 50ms
        await new Promise(resolve => setTimeout(resolve, 50))

        // Recurse
        scrollRight()
    }



    // When component is mounted
    onMount(() => {
        // Start scroller
        scrollRight()
    })
</script>

<!-- Bind div to `scroller` so it can be accessed by the script -->
<div class="scroller" bind:this={scroller}>
    <!-- Children go here -->
    <slot/>
</div>

<style>
    .scroller {
        width: 100%;

        white-space: nowrap;
        overflow: hidden;
    }
</style>