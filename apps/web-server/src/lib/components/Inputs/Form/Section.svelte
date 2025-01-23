<script lang="ts">

// #region Imports

// Import types
import type { Snippet } from "svelte"

// #endregion Imports


// Get props
interface Props {
	children?: Snippet
}
let {
	children
}: Props = $props()

</script>


<div class="form__section">
	{@render children?.()}
</div>


<style lang="scss">

.form__section {
	display: flex;
	flex-direction: column;
	gap: calc(var(--spacing) / 2);


	& > :global(.inputs__wrapper) {
		margin-bottom: calc(var(--spacing) / 2);

		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing) / 2);
	}
}


:global(.buttons__wrapper) {
	margin-top: calc(var(--spacing) / 2);

	display: flex;
	flex-wrap: wrap-reverse;
	gap: calc(var(--element-scale) * var(--size-1));


	& :global(.form__button.tertiary) {
		margin-right: auto;
	}

	& :global(.buttons__group) {
		display: flex;
		flex-grow: 1;
		flex-wrap: wrap-reverse;
		gap: calc(var(--element-scale) * var(--size-4));


		& :global(.form__button) {
			flex-grow: 1;
		}
	}
}

</style>