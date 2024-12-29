<script lang="ts">

// #region Imports

/*
	https://svelte.dev/docs/kit/@sveltejs-kit#Page
	Store containing page information
*/
import { page } from "$app/stores"

// #endregion Imports

</script>


<div>
	<!-- Display the error status code and message -->
	<h1>{$page.status}: {$page.error.message}</h1>
</div>