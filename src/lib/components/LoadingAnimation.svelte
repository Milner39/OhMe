<script>
    // #region Imports
    import Chart from "$lib/assets/svgs/Chart.svelte"
    // #endregion
</script>

<div class="animation">
    <Chart/>
</div>

<style lang="scss">
    .animation > :global(svg) {
        height: 100%;

        :global(path.animate) {
            animation: loadingSvg 2500ms ease infinite;
        }
    }

    @keyframes loadingSvg {
        0%, 25% {
            opacity: 1;
            stroke-dasharray: 100%;
            stroke-dashoffset: 200%;
        }
        62.499% {
            opacity: 0;
            stroke-dasharray: 100%;
            stroke-dashoffset: 100%;
        }
        62.501% {
            opacity: 0;
            stroke-dasharray: 100%;
            stroke-dashoffset: 300%;
        }
        100% {
            opacity: 1;
            stroke-dasharray: 100%;
            stroke-dashoffset: 200%;
        }
    }
</style>