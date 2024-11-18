<script lang="ts">

// #region Imports

/*
	https://kit.svelte.dev/docs/modules#$app-stores-page
	Store containing page information
*/
import { page } from "$app/stores"

// #endregion Imports

</script>


<div>
	<h1>{$page.status}: {$page.error.message}</h1>
</div>