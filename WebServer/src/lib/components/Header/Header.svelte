<script lang="ts">

// #region Imports

// Import components used in this component
import Nav from "./Nav.svelte"

// Import types
import type { Snippet } from "svelte"

// #endregion Imports



// Get props
interface Props {
	children: Snippet<[{ Nav: typeof Nav }]>
}
let {
	children
}: Props = $props()

</script>


<header>
	{@render children?.({ Nav })}
</header>


<style lang="scss" scoped>

header {

	// Positioning
	position: sticky; // Fix to the top of the viewport
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;

	// Border
	border-style: solid;
	border-color: var(--color-bg-4);
	border-width: 0 0 1px 0;

	// Box shadow
	box-shadow: var(--box-shadow-1);
	
}

</style>