<script>
    // Import styles
    import "$lib/styles/global.scss"

    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // https://svelte.dev/docs/svelte#onmount
    // onMount: runs a function as soon as component has been mounted on the DOM
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // https://kit.svelte.dev/docs/modules#$app-navigation-goto
    // Import function to redirect user
    import { goto } from "$app/navigation"

    // When component is mounted
    onMount(() => {
        // Redirect client in 3 seconds
        setTimeout(() => {
            goto("/")
        }, 3000)
    })

</script>

<div>
    <!-- Show error information -->
    <h2>{$page.status}: {$page.error.message}</h2>
    <h3>Returning you home...</h3>
</div>

<style lang="scss">
    div {
        width: 100vw;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        background-color: var(--bg-3);
    }
</style>