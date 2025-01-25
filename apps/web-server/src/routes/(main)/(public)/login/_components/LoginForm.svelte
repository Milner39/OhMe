<script lang="ts">

// #region Imports

import Form from "$lib/components/Inputs/Form/Form.svelte"
import { applyAction } from "$app/forms"
import { getFormData } from "$lib/utils/form-utils"

import { Validator } from "#validation/src/index"


// Import types
import type { LoginFormData } from "../.d"

// #endregion Imports



// Instantiate the validator
const validator = new Validator()

</script>


<Form action="?/login"
	onsubmit={(event) => {

		// Get form inputs
		const formData = getFormData(event.formData) as LoginFormData


		// Validate form inputs
		let validInputs = true

		const validateUsername = validator.username(formData.username)
		if (validateUsername.result === false) validInputs = false
		console.log("Username:", validateUsername)

		const validatePassword = validator.password(formData.password)
		if (validatePassword.result === false) validInputs = false
		console.log("Password:", validatePassword)


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
		FTextInput
	})}
		<Title>
			<h1>Log In</h1>
			<p>All fields marked with "*" are required.</p>
		</Title>
		<Section>
			{#snippet children()}
				<!-- <h2>User credentials</h2> -->
				<div class="inputs__wrapper">
					<FTextInput 
						name="username"
						placeholder="John Doe"
						required={true}
						autocomplete="username"
					>
						{#snippet labelContent()}
							<p>Username *</p>
						{/snippet}
					</FTextInput>
					<FTextInput 
						name="password"
						placeholder="Password123"
						required={true}
						autocomplete="current-password"
						secure={true}
					>
						{#snippet labelContent()}
							<p>Password *</p>
						{/snippet}
					</FTextInput>
				</div>
			{/snippet}
		</Section>
		<Section>
			<div class="buttons__wrapper">
				<FButton classes="tertiary"
					type="link" href="?mode=reset-password"
				>
					<p>Forgot Password?</p>
				</FButton>
				<div class="buttons__group">
					<FButton classes="secondary"
						type="link" href="?mode=register"
					>
						<p>Register Instead</p>
					</FButton>
					<FButton><p>Log In</p></FButton>
				</div>
			</div>
		</Section>
	{/snippet}
</Form>