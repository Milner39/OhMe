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


<div class="form__title">
	{@render children?.()}
</div>