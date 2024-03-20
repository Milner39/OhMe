<script>
    export let bars
    let max = bars.reduce((max, bar) => max = Math.max(max, bar.value), 0)

</script>

<div class="barChart">
    {#each bars as bar}
        <div class="bar" style="width: {Math.ceil(100*(bar.value / max))}%; background-color: {bar.bgColor};"/>
        <h2>{bar.label}</h2>
    {/each}
</div>

<style lang="scss">

    .barChart {
        display: grid;
        gap: 1rem;

        grid-auto-flow: row;
        grid-template-columns: [bar] 1fr [label] auto;
    }

    .bar {
        grid-column: bar;

        border-radius: 1000px;
    }

    h2 {
        grid-column: label;

        color: var(--tx-3);
        font-size: 1rem;
        font-weight: 300;
    }

</style>