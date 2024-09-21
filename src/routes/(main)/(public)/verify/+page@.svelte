<script>
    // #region Imports

    // Import svgs
    import Checkmark from "$lib/assets/svgs/Checkmark.svelte"
    import Close from "$lib/assets/svgs/Close.svelte"

    // Import components
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte"

    /*
        https://kit.svelte.dev/docs/modules#$app-stores-page
        Store containing page information
    */
    import { page } from "$app/stores"
    // #endregion


    
    /*
        Reactive statements are indicated by the `$:` label
        https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
        "Reactive statements run:
         - after other script code
         - before the component markup is rendered
         - whenever the values that they depend on have changed."
    */

    /*
        https://kit.svelte.dev/docs/load#$page-data
        Get data from load subroutines
    */
    $: data = $page.data
</script>

<div class="page">
    {#await data.streamed}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then streamed} 
        <div class="block loaded" class:valid={streamed.status === 200}>
            {#if streamed.status === 200}
                <Checkmark/>
                <h4 class="thickFW">Email has been verified</h4>
                <a class="button-pill" href="/"><h5>Return Home</h5></a>
            {:else}
                <Close/>
                <h5>{streamed.errors?.client || "Something went wrong, try again later..."}</h5>
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

        > :global(svg) {
            color: var(--red);
            height: 10rem;
        }

        &.valid > :global(svg) {
            color: var(--green);
        }
    }
</style>