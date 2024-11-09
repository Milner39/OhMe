<script>
    // #region Imports
    import Nav from "./Nav.svelte"
    import Notice from "./Notice.svelte"
    // #endregion
</script>

<header>
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