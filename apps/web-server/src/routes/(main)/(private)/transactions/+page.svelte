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

	<div class="page-stats main-content flex col">
		<h2>Transaction Information</h2>
		<div>
			<p>Total cash flow: </p>
		</div>
	</div>
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

</style>