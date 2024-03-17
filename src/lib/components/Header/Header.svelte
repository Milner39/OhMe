<script>
    import Nav from "./Nav.svelte"
    import Notice from "./Notice.svelte"
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
        z-index: 1000;

        box-shadow: #000000 0 4px 30px;

        > :global(*) {
            padding: 0 0.75rem;
        }
    }

</style>