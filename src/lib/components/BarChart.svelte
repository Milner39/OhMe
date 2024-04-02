<script>
    // Let bars be passed to component as prop
    export let bars

    // Get the largest value by checking all bar values
    const maxValue = bars.reduce((max, bar) => max = Math.max(max, bar.value), 0)
</script>

<div class="barChart">
    <!-- Create bar and label for every item in "bars" -->
    {#each bars as bar}
        <!-- Set width as a percentage of "maxValue", 100% filling all availible space -->
        <div class="bar" style="width: {Math.ceil(100*(bar.value / maxValue))}%; background-color: {bar.bgColor};"/>
        <h6>{bar.label}</h6>
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

    h6 {
        grid-column: label;

        color: var(--tx-4);
        font-weight: 300;
    }

</style>