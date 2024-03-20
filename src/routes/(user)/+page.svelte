<script>
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import BarChart from "$lib/components/BarChart.svelte"

    import Wallet from "$lib/assets/svgs/Wallet.svelte"
</script>

<Banner>
    <Wallet slot="svg"/>
    <h1>Dashboard</h1>
    <AutoScroll>
        <h2>Get General Information About Your Account Here</h2>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="pageContent">
        <div class="Cashflow block">
            <h1>Cash Flow</h1>
            <BarChart
                bars={[
                    {
                        value: 345,
                        bgColor: "var(--green)",
                        label: "£345 Owed To You"
                    },
                    {
                        value: 104,
                        bgColor: "var(--red)",
                        label: "£104 Owed To Payees"
                    }
                ]}
            />
            <h1>Total Debts: <span class="deptNumber">-£241</span></h1>
        </div>
    </div>
</div>

<style lang="scss">

    .deptNumber {
        color: var(--green);
        font-weight: 600;
    }

    .page {
        color: var(--tx-1);
        background-color: var(--bg-2);
    }

    .pageContent {
        max-width: var(--page-max-width);
        margin-inline: auto;

        padding: 1rem;

        height: 200vh;
    }

    .block {
        padding: 1rem;

        background-color: var(--bg-3);

        border: solid 1px var(--bg-4);
        border-radius: 0.5rem;

        box-shadow: var(--box-shadow-1);
    }

    .Cashflow {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        h1 {
            font-size: 1rem;
            font-weight: 500;
        }
    }

</style>