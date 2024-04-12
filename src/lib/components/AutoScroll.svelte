<script>
    // https://svelte.dev/docs/svelte#onmount
    // onMount: runs a function as soon as component has been mounted on the DOM
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // The html element that will scroll
    let scroller

    // The scroll position messured in px, starting at 0
    let scroll = 0

    // Define function to scroll across div
    const scrollRight = async () => {
        // Increment scroll position
        scroll += 1

        // Scroll to new position
        scroller.scrollTo({ left: scroll, behavior: 'smooth' })

        // If scroll position is larger than the maximum scroll distance
        if (scroll >= scroller.scrollWidth - scroller.clientWidth) {
            // Wait 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Check html element has not been unmounted
            if (scroller) {
                // Reset scroll position
                scroller.scrollLeft = 0
                scroll = 0
            }
        }
    }

    // When component is mounted
    onMount(() => {
        // Call scroll function every 50ms
        const intervalId = setInterval(scrollRight, 50)
        // When component is unmounted
        return () => {
            // Clear interval so scroll function stops being called
            clearInterval(intervalId)
        }
    })
</script>

<!-- Bind div to `scroller` so it can be accesed by the script -->
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