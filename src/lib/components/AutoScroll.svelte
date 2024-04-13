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
        // Check if `scroller` element is at starting position: Wait 3000ms
        if (scroll === 0) {await new Promise(resolve => setTimeout(resolve, 3000))}

        // Increment scroll position
        scroll += 1

        // Check `scroller` element has not been unmounted
        if (!scroller) {return}

        // Scroll to new position
        scroller.scrollTo({ left: scroll, behavior: 'smooth' })

        // If scroll position is larger than the maximum scroll distance
        if (scroll > scroller.scrollWidth - scroller.clientWidth) {
            // Wait 3000ms
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Check `scroller` element has not been unmounted
            if (!scroller) {return}

            // Reset scroll position
            scroller.scrollLeft = 0
            scroll = 0
        }
        // Wait 50ms
        await new Promise(resolve => setTimeout(resolve, 50))
        scrollRight()
    }

    // When component is mounted
    onMount(() => {
        scrollRight()
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