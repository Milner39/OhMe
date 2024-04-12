<script>
    // Import svgs
    import Wallet from "$lib/assets/svgs/Wallet.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import BarChart from "$lib/components/BarChart.svelte"
</script>

<Banner>
    <Wallet slot="svg"/>
    <h4>Dashboard</h4>
    <AutoScroll>
        <h6>Get General Information About Your Account Here</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="pageContent">
        <div class="block">
            <h6>Cash Flow</h6>
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
            <h6>Total Cashflow: <span>£241</span></h6>
        </div>
    </div>
</div>

<style lang="scss">

    span {
        color: var(--green);
        font-weight: 600;
    }

</style>