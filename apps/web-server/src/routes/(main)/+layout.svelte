<script lang="ts">

// #region Imports

import Header from "$lib/components/Header/Header.svelte"


// Import types
import type { Snippet } from "svelte"

// #endregion Imports


// Get props
interface Props {
	children: Snippet
}
let {
	children
}: Props = $props()

</script>


<Header>
	{#snippet children({ Nav })}
		<Nav links={[
			{ text: "Home", href: "/" },
			{ text: "About", href: "/about" },
			{ text: "Transactions", href: "/transactions" },
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
	{/snippet}
</Header>

<!-- Children go here -->
{@render children()}