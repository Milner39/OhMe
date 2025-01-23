<script lang="ts">

// #region Imports

// Import the different forms for this page
import CreateTransactionForm from "./_components/CreateTransactionForm.svelte"


// Import types
import type { PageData, ActionData } from "./$types"

// #endregion Imports


// Get page data
let { data, form }: { data: PageData, form: ActionData } = $props()

// Log response from form submissions
$effect(() => { if (form) console.log("form response:", form) })

</script>


<div class="page-wrapper">
	<CreateTransactionForm/>
</div>


<style lang="scss">

.page-wrapper {
	padding: var(--size-4);

	flex-grow: 1;

	display: flex;
	align-items: center;
	justify-content: center;
}

</style>