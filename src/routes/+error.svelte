<script>
    // Import styles
    import "$lib/styles/global.scss";

    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // Import function to redirect user
    import { goto } from "$app/navigation"

    // Import page to get error information
    import { page } from "$app/stores"

    // Redirect the user after 3s
    onMount(() => {
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
        height: 100vh;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        
        background-color: var(--bg-3);
    }
</style>