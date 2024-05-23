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

<div class="page">
    {#await $page.data.streamed}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then data} 
        <div class="block loaded" class:valid={data.status === 200}>
            {#if data.status === 200}
                <Checkmark/>
                <h4 class="title">Email has been verified</h4>
                <a class="button-pill" href="/"><h5>Return Home</h5></a>
            {:else}
                <Close/>
                {#if data.status === 400}
                    <h5>Invalid verification request</h5>
                {:else if data.status === 401}
                    <h5>Verification code expired</h5>
                {:else if data.status === 409}
                    <h5>Email already verified</h5>
                {:else if data.status === 422}
                    <h5>Incorrect verification code</h5>
                {:else if data.status === 503}
                    <h5>Failed to fetch from database</h5>
                {/if}
                <a class="button-pill" href="/"><h5>Return Home</h5></a>
            {/if}
        </div>
    {/await}
</div>

<style lang="scss">
    .page {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;

        padding: 1rem;

        background-color: var(--bg-3);
    }

    .loading {
        width: 10rem;
        color: var(--br-3);
    }

    .block {
        flex-grow: 1;
        max-width: 500px;

        text-align: center;

        >.title {
            font-weight: 600;
        }

        > :global(svg) {
            color: var(--red);
            height: 10rem;
        }

        &.valid > :global(svg) {
            color: var(--green);
        }
    }
</style>