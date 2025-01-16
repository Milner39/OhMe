<script lang="ts">

// #region Imports

// Import types
import type { PageData } from "./$types"

// #endregion Imports


// Get page data
let { data }: { data: PageData } = $props()

</script>


<div class="page-wrapper flex col">
	<div class="page-description main-content flex col">
		<div class="flex col text-center">
			<h1>Transactions</h1>
			<p>Transaction you create will show up here...</p>
		</div>
		<a class="button--pill font-weight-black flex" href="transactions/create">
			<p>Create Transaction</p>
		</a>
	</div>

	{#if data.transactions !== null && data.transactions.length > 0}
		{@const totalCashFlow = data.transactions
			.reduce((total, transaction) => {
				return total + Number(transaction.amount)
			}, 0)
		}

		<div class="page-stats main-content flex col">
			<h2>Total Transaction Information</h2>
			<div>
				<p>Total cash flow: £{totalCashFlow}</p>
			</div>
		</div>

		<div class="transactions main-content flex col">
			<h2>Transactions</h2>
			{#each data.transactions as transaction}
				<div class="transaction flex col">
					<p>Amount: £{transaction.amount}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>


<style lang="scss">

.page-wrapper {
	padding: var(--size-4);

	flex-grow: 1;

	gap: var(--size-6);
}

.page-description {
	gap: var(--gap);
	align-items: center;

	background-color: transparent;
}

.transactions {
	gap: var(--gap);

	& > :global(* + *) {
		position: relative;


		&::before {
			content: "";
			position: absolute;

			--size: 1px;
			width: 100%;
			height: 1px;
			top: calc(-1 * (var(--gap) / 2 + var(--size) / 2));

			background-color: var(--color-bg-4);
		}
	}
}

</style>