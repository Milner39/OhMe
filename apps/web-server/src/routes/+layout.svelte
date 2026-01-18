<script lang="ts">
  import "$lib/styles/tailwind.css"  // Load Shadcn style sheet
  import "$lib/styles/global.scss"  // Load global style sheet

  import favicon from "$lib/assets/favicon.svg"


  const { children } = $props()
</script>

<svelte:head>
  <!-- Load favicon -->
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
