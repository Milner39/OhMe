<script>
    // Import components used in Header for cleaner components
    import Nav from "./Nav.svelte"
    import Notice from "./Notice.svelte"
</script>

<header>
    <!-- Allow parent components to use child components -->
    <slot {Nav}{Notice}/>
</header>

<style lang="scss">

    header {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;

        border: solid var(--bg-4);
        border-width: 0 0 1px 0;
        box-shadow: var(--box-shadow-1);
    }

</style>