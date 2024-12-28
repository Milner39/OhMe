<script lang="ts">

// #region Imports

// Import global styles
import "$lib/styles/global.scss"


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


<!-- Children go here -->
{@render children()}