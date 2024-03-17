<script>
    import Close from "$lib/assets/svgs/Close.svelte"

    let show = true
    let message
    let scroll = 0

    const close = () => {
        show = false
    }

    const scrollRight = async () => {
        message.scrollTo({ left: scroll, behavior: 'smooth' })
        scroll += 1
        if (scroll >= message.scrollWidth - message.clientWidth) {
            await new Promise(resolve => setTimeout(resolve, 3000))
            if (message) {
                message.scrollLeft = 0
                scroll = 0
            }
        }
    }

    let clear
    $: {
        clearInterval(clear)
        if (message) {
            clear = setInterval(scrollRight, 50)
        }
    }

</script>

{#if show}
    <div class="notice">
        <button title="close notice" class="button-slim" type="button" on:click={close}><Close/></button>
        <div class="message" bind:this={message}>
            <slot/>
        </div>
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

        >.message {
            font-size: 1rem;
            text-wrap: nowrap;
            overflow: hidden;
        }
    }

</style>