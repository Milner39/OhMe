<script lang="ts">

// #region Imports

import Form from "$lib/components/Inputs/Form/Form.svelte"

// #endregion Imports

</script>


<Form action="?/register">
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