<script lang="ts">

// #region Imports

import Form from "$lib/components/Inputs/Form/Form.svelte"
import { applyAction } from "$app/forms"
import { getFormData } from "$lib/utils/form-utils.ts"

import { Validator } from "#validation/src/index.ts"


// Import types
import type { CreateTransactionFormData } from "../.d.ts"

// #endregion Imports



// Instantiate the validator
const validator = new Validator()

</script>


<Form action="?/create"
	onsubmit={(event) => {

		// Get form inputs
		const formData = getFormData(event.formData) as CreateTransactionFormData


		// Validate form inputs
		let validInputs = true

		const validateAmount = validator.cost(Number(formData.amount))
		if (validateAmount.result === false) validInputs = false
		console.log("Amount:", validateAmount)


		// Cancel form submission if inputs are invalid
		if (!validInputs) {
			console.log("Form submission cancelled")
			event.cancel()
			return
		}

		// Allow form submission
		console.log("Form submission allowed")
		return async ({ result, update }) => {
			await update()
			await applyAction(result)
		}
	}}
>
	{#snippet children({
		Title,
		Section,
		FButton,
		FTextInput,
		FNumberInput
	})}
		<Title>
			<h1>Create Transaction</h1>
			<p>All fields marked with "*" are required.</p>
		</Title>
		<Section>
			{#snippet children()}
				<div class="inputs__wrapper">
					<FTextInput 
						name="username"
						placeholder="John Doe"
						required={true}
					>
						{#snippet labelContent()}
							<p>Username *</p>
						{/snippet}
					</FTextInput>
					<FNumberInput 
						name="amount"
						placeholder="15.99"
						required={true}
					>
						{#snippet labelContent()}
							<p>Amount *</p>
						{/snippet}
					</FNumberInput>
				</div>
			{/snippet}
		</Section>
		<Section>
			<div class="buttons__wrapper">
				<div class="buttons__group">
					<FButton><p>Create</p></FButton>
				</div>
			</div>
		</Section>
	{/snippet}
</Form>