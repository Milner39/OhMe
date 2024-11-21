<script lang="ts">

// #region Imports

import Header from "$lib/components/Header/Header.svelte"

// #endregion Imports

</script>


<Header let:Nav>
	<Nav links={[
		{ text: "Home", href: "/" },
		{ text: "About", href: "/about" },
	]}>
		{#snippet brandContent()}
			<h1>OhMe</h1>
		{/snippet}

		{#snippet extraContent()}
			<a class="button dropdown__button" href="/settings">
				<p class="collapsible-target font-weight-black">Settings</p>
			</a>
		{/snippet}

		{#snippet staticContent()}
			<a class="button--pill font-weight-black" href="/login">
				<p>Log In</p>
			</a>
		{/snippet}
	</Nav>
</Header>

<!-- Children go here -->
<slot/>