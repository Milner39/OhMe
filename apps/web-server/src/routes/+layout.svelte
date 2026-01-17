<script lang="ts">
  import favicon from "$lib/assets/favicon.svg"

  import "$lib/styles/global.scss"  // Load global style sheet


  const { children } = $props()
</script>

<svelte:head>
  <!-- Load favicon -->
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
