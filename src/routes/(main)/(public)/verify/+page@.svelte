<script>
    // Import styles
    import "$lib/styles/global.scss"
    
    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // Import components
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte"

    // Import svgs
    import Checkmark from "$lib/assets/svgs/Checkmark.svelte"
    import Close from "$lib/assets/svgs/Close.svelte"
</script>

<div class="content">
    {#await $page.data.streamed}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then data} 
        <div class="loaded" class:valid={data.status === 200}>
            {#if data.status === 200}
                <Checkmark/>
            {:else}
                <Close/>
            {/if}
            <div class="block">
                {#if data.status === 200}
                    <h4>Email has been verified</h4>
                {:else if data.status === 400}
                    <h4>Invalid verification request</h4>
                {:else if data.status === 401}
                    <h4>Verification code expired</h4>
                {:else if data.status === 409}
                    <h4>Email already verified</h4>
                {:else if data.status === 422}
                    <h4>Incorrect verification code</h4>
                {:else if data.status === 503}
                    <h4>Failed to fetch from database</h4>
                {/if}
                <a class="button-pill" href="/"><h5>Return Home</h5></a>
            </div>
        </div>
    {/await}
</div>

<style lang="scss">
    .content {
        width: 100vw;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        padding: 1rem;

        text-align: center;
        
        background-color: var(--bg-3);
    }

    .loading {
        width: 10rem;
        color: var(--br-3);
    }

    .loaded {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        > :global(svg) {
            color: var(--red);
            height: 10rem;
        }

        &.valid > :global(svg) {
            color: var(--green);
        }
    }
</style>