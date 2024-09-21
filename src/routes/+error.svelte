<script>
    // #region Imports

    /*
        https://kit.svelte.dev/docs/modules#$app-stores-page
        Store containing page information
    */
    import { page } from "$app/stores"

    /*
       https://svelte.dev/docs/svelte#onmount
       Subroutine that runs when the component is mounted
    */
    import { onMount } from "svelte"

    /*
        https://kit.svelte.dev/docs/modules#$app-navigation-goto
        Subroutine to redirect client
    */
    import { goto } from "$app/navigation"
    // #endregion



    // When component is mounted
    onMount(() => {
        // Redirect client in 3 seconds
        setTimeout(() => {
            goto("/")
        }, 3000)
    })

</script>

<div class="content">
    <div class="block">
        <!-- Show error information -->
        <h3>{$page.status}: {$page.error.message}</h3>
        <h4>Returning you home...</h4>
    </div>
</div>

<style lang="scss">
    .content {
        width: 100vw;

        flex-grow: 1;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        padding: 1rem;

        text-align: center;
        
        background-color: var(--bg-3);
    }
</style>