<script lang="ts">

// #region Imports

// Import types
import type { Snippet } from "svelte"

// #endregion Imports


// Get props
interface Props {
	classes?: string,
	type?: "link" | "button" | "submit" | "reset",
	formaction?: string,
	href?: string,
	children?: Snippet
}
let {
	classes,
	type = "submit",
	formaction,
	href,
	children
}: Props = $props()

</script>


{#if type === "link"}
	<a class={"form__button button " + (classes ?? "")}
		{href}
	>
		{@render children?.()}
	</a>
{:else}
	<button class={"form__button button " + (classes ?? "")}
		{formaction} {type}
	>
		{@render children?.()}
	</button>
{/if}


<style lang="scss">

:global(.form__button) {
	display: inline-block;

	text-align: center;
	
	background-color: var(--color-brand-p3);
	
	padding: 0.25em 0.75em;
	border-radius: calc(var(--element-scale) * var(--size-2));
}

:global(.form__button.secondary) {
	background-color: var(--color-bg-4);
}

:global(.form__button.tertiary) {
	background-color: transparent;
}

</style>