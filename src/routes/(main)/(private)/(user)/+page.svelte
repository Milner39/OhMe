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
        <div class="block">
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
            <h1>Total Cashflow: <span class="deptNumber">£241</span></h1>
        </div>
    </div>
</div>

<style lang="scss">

    .deptNumber {
        color: var(--green);
        font-weight: 600;
    }

    .block {

        h1 {
            font-size: 1rem;
            font-weight: 500;
        }
    }

</style>