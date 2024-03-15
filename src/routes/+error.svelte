<script>
    import "$lib/styles/global.scss";

    import { onMount } from "svelte"
    import { goto } from "$app/navigation"
    import { page } from "$app/stores"

    onMount(() => {
        setTimeout(() => {
        goto("/")
    }, 3000)
    })

</script>

<div>
    <h1>{$page.status}: {$page.error.message}</h1>
    <h2>Returning you home...</h2>
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
        color: var(--tx-1);
    }
</style>