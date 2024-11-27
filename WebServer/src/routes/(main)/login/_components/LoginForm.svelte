<script lang="ts">

// #region Imports

import Form from "$lib/components/Inputs/Form/Form.svelte"

// #endregion Imports

</script>


<Form action="?/login">
	{#snippet children({
		Title,
		Section,
		FButton,
		FTextInput
	})}
		<Title>
			<h1>Login</h1>
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
					>
						{#snippet labelContent()}
							<p>Username *</p>
						{/snippet}
					</FTextInput>
					<FTextInput 
						name="password"
						placeholder="Password123"
						required={true}
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
					<FButton><p>Login</p></FButton>
				</div>
			</div>
		</Section>
	{/snippet}
</Form>