<script>
    // Import functions to handle lifecycle events
    import { onMount, onDestroy } from "svelte"

    // The html element that will scroll
    let scroller

    // The scroll position messured in px
    let scroll = 0

    // Create function to scroll across div
    const scrollRight = async () => {
        // Scroll to new position and increment position
        scroller.scrollTo({ left: scroll, behavior: 'smooth' })
        scroll += 1

        // If scroll position is larger than the maximum distance the div can scroll
        if (scroll >= scroller.scrollWidth - scroller.clientWidth) {

            // Wait 3 seconds
            await new Promise(resolve => setTimeout(resolve, 3000))
            // Check div has not been destroyed before reseting scroll position to 0
            if (scroller) {
                scroller.scrollLeft = 0
                scroll = 0
            }
        }
    }

    let intervalId 
    // When component is mounted, repeatedly call scroll function every 50ms
    onMount(() => {
        intervalId = setInterval(scrollRight, 50)
    })

    // When component is destroyed, stop calling scroll function
    onDestroy(() => {
        clearInterval(intervalId)
    })
</script>

<!-- Bind div to the "scroller" variable so it can be accesed in script -->
<div class="scroller" bind:this={scroller}>
    <slot/>
</div>

<style>
    .scroller {
        width: 100%;

        white-space: nowrap;
        overflow: hidden;
    }
</style>