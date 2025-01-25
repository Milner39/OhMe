<script lang="ts">

// #region Imports

/*
	https://svelte.dev/docs/kit/$app-state
	State containing page information
*/
import { page } from "$app/state"

// #endregion Imports

</script>


<div>
	<!-- Display the error status code and message -->
	<h1>{page.status}: {page.error.message}</h1>
</div>