<script>
    // Import components used in Header for cleaner imports
    import Nav from "./Nav.svelte"
    import Notice from "./Notice.svelte"
</script>

<header>
    <!-- Allow parent components/pages to use child components -->
    <slot {Nav}{Notice}/>
</header>

<style lang="scss">

    header {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;

        box-shadow: var(--box-shadow-1);

        > :global(*) {
            padding: 0 0.75rem;
        }
    }

</style>