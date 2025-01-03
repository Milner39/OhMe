<script lang="ts">

// #region Imports

// Import the different forms for this page
import LoginForm from "./_components/LoginForm.svelte"
import RegisterForm from "./_components/RegisterForm.svelte"


// Import types
import type { PageData, ActionData } from "./$types"

// #endregion Imports


// Get page data
let { data, form }: { data: PageData, form: ActionData } = $props()

</script>


<div class="page-wrapper">
	<!-- Display the correct form based on the mode -->
	{#if data.mode === "login"}
		<LoginForm/>
	{:else if data.mode === "register"}
		<RegisterForm/>
	{:else if data.mode === "reset-password"}
		<h1>TODO</h1>
	{/if}
</div>


<style lang="scss">

.page-wrapper {
	padding: var(--size-6);

	flex-grow: 1;

	display: flex;
	align-items: center;
	justify-content: center;
}

</style>