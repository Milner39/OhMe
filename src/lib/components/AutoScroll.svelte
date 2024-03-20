<script>
    import { onMount, onDestroy } from "svelte"

    let scroller
    let scroll = 0

    const scrollRight = async () => {
        scroller.scrollTo({ left: scroll, behavior: 'smooth' })
        scroll += 1
        if (scroll >= scroller.scrollWidth - scroller.clientWidth) {
            await new Promise(resolve => setTimeout(resolve, 3000))
            if (scroller) {
                scroller.scrollLeft = 0
                scroll = 0
            }
        }
    }

    let intervalId 
    onMount(() => {
        intervalId = setInterval(scrollRight, 50)
    })

    onDestroy(() => {
        clearInterval(intervalId)
    })

</script>

<div class="scroller" bind:this={scroller}>
    <slot/>
</div>

<style>
    .scroller {
        width: 100%;

        text-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
    }
</style>