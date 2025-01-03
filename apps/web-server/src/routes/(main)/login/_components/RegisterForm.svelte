<script lang="ts">

// #region Imports

import Form from "$lib/components/Inputs/Form/Form.svelte"
import { applyAction } from "$app/forms"
import { getFormData } from "$lib/utils/form-utils.ts"

import { Validator } from "#validation/src/index"

// Import types
import type { RegisterFormData } from "../.d.ts"

// #endregion Imports



// Instantiate the validator
const validator = new Validator()

</script>


<Form action="?/register"
	onsubmit={(event) => {

		// Get form inputs
		const formData = getFormData(event.formData) as RegisterFormData
		console.log(formData)


		// Validate form inputs
		let validInputs = true

		const validateUsername = validator.username(formData.username)
		if (validateUsername.result === false) validInputs = false
		console.log("Username:", validateUsername)

		const validateEmail = validator.email(formData.email)
		if (validateEmail.result === false) validInputs = false
		console.log("Email:", validateEmail)

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
			<h1>Register</h1>
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
						name="email"
						placeholder="John.Doe@email.com"
						required={true}
						autocomplete="email"
					>
						{#snippet labelContent()}
							<p>Email *</p>
						{/snippet}
					</FTextInput>
					<FTextInput 
						name="password"
						placeholder="Password123"
						required={true}
						autocomplete="new-password"
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
				<div class="buttons__group">
					<FButton classes="secondary"
						type="link" href="?mode=login"
					>
						<p>Login Instead</p>
					</FButton>
					<FButton><p>Register</p></FButton>
				</div>
			</div>
		</Section>
	{/snippet}
</Form>