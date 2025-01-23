<script lang="ts">

// #region Imports

// Import global styles
import "$lib/styles/global.scss"


// Import types
import type { Snippet } from "svelte"
import type { PageData } from "./$types"

// #endregion Imports


// Get props
interface Props {
	children: Snippet,
	data: PageData
}
let {
	children,
	data
}: Props = $props()

</script>


{#if data.userData !== null}
	<!-- Children go here -->
	{@render children()}
{/if}