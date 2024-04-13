<script>
    // Import styles
    import "$lib/styles/global.scss"
    
    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // Import components
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte";
</script>

<div class="content">
    {#await $page.data.streamed}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then data} 
        {#if data.status === 200}
            <h3>Email has been verified</h3>
            <h4>Your can return to the other page</h4>
        {:else if data.status === 400}
            <h3>Invalid verification request</h3>
            <h4>Close this page</h4>
        {:else if data.status === 401}
            <h3>Verification code expired</h3>
            <h4>Close this page</h4>
        {:else if data.status === 409}
            <h3>Email already verified</h3>
            <h4>Close this page</h4>
        {:else if data.status === 422}
            <h3>Incorrect verification code</h3>
            <h4>Close this page</h4>
        {:else if data.status === 503}
            <h3>Failed to fetch from database</h3>
            <h4>Close this page</h4>
        {/if}
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

        text-align: center;
        
        background-color: var(--bg-3);
    }

    .loading {
        min-width: 10rem;

        display: flex;
        align-items: center;
        justify-content: center;

        color: var(--br-3);

        >:global(*) {
            flex: 1;
        }
    }
</style>