<script lang="ts">

// #region Imports

/*
	https://svelte.dev/docs/svelte#onmount
	Subroutine that runs when the component is mounted
*/
import { onMount } from "svelte"

/*
	https://kit.svelte.dev/docs/modules#$app-navigation-onnavigate
	Subroutine that runs when the client navigates
*/
import { onNavigate } from "$app/navigation"


/*
	https://svelte.dev/docs/svelte-transition
	Import transitions and easing functions
*/
import { fly, fade } from "svelte/transition"
import { quadInOut } from "svelte/easing"


// Import svgs
import Close from "$lib/assets/svgs/Close.svelte"
import Menu from "$lib/assets/svgs/Menu.svelte"


// Import types
import type { Snippet } from "svelte"

// #endregion Imports



// Get props
interface Props {
	links?: { text: string, href: string }[],
	brandContent?: Snippet,
	staticContent?: Snippet,
	extraContent?: Snippet,
}
let {
	links = [],
	brandContent,
	staticContent,
	extraContent
}: Props = $props()


// The nav HTML element
let nav: HTMLElement

// The button HTML element that toggles the dropdown
let dropdownButton: HTMLButtonElement


// Reactive state
let navCollapsed: boolean = $state(true)
let dropdownOpen: boolean = $state(false)


// Subroutine to toggle open dropdown
const toggleDropdown = () => {
	dropdownOpen = !dropdownOpen
}


// Subroutine to run when the collapsable portion of the nav is resized
const onResize = () => {

	// Get element containing collapsible content
	const collapseEl = nav.getElementsByClassName("nav__collapsible")[0]

	// Get all elements with the `.collapsible-target` class in collapsable div
	const collapsibleItemsEl = [
		...collapseEl.getElementsByClassName("collapsible-target")
	]

	// Get element containing the nav links
	const navLinksEl = collapseEl.getElementsByClassName("nav__link__list")[0]

	// Get element containing extra elements
	const extraEl = collapseEl.getElementsByClassName("collapsible__extra")[0]

	// Get element containing static elements
	const staticEl = nav.getElementsByClassName("nav__static")[0]



	// Get width of collapsable div
	const containerWidth = collapseEl.clientWidth

	// Calculate total width of the collapsible items
	const totalCollapsibleItemWidth = collapsibleItemsEl.reduce(
		(total, item) => total + item.clientWidth, 0
	)



	// Get gap between nav links and static div
	const collapsibleGap = Number(window.getComputedStyle(collapseEl)
		.columnGap
		.slice(0,-2)
	)

	// Get gap between items in nav links
	const navLinksGap = Number(window.getComputedStyle(navLinksEl)
		.columnGap
		.slice(0,-2)
	)

	// Get gap between items in extra div
	const extraGap = Number(window.getComputedStyle(extraEl)
		.columnGap
		.slice(0,-2)
	)

	// Get gap between items in static div
	const staticGap = Number(window.getComputedStyle(staticEl)
		.columnGap
		.slice(0,-2)
	)

	// Calculate the total width taken up by spacing between items
	const spacingWidth =
		collapsibleGap +
		(navLinksGap * (navLinksEl.childElementCount -1)) +
		(extraGap * (extraEl.childElementCount -1))



	// Get width of `dropdownButton`
	const dropdownButtonWidth = dropdownButton.clientWidth

	/*
		Calculate the extra width taken up by elements that only appear when
		`navCollapsed === true`

		Static difference will be
		`staticGap + dropdownButtonWidth` or `0`
		depending on `navCollapsed`
	*/
	const staticDifference = 
		(staticGap + dropdownButtonWidth) *
		Number(navCollapsed)



	// Check if the collapsible portion of the nav should be collapsed
	navCollapsed = (
		containerWidth + staticDifference <
		totalCollapsibleItemWidth + spacingWidth
	)

	/*
		If `navCollapsed === true`:
			set `dropdownOpen` to its current value
		Else:
			set `dropdown` to `false`

		This logic closes the dropdown only if the nav not collapsed
	*/
	dropdownOpen = !navCollapsed ? dropdownOpen : false
}



// When component is mounted
onMount(() => {
	// Create a resize observer
	const resizeObserver = new ResizeObserver(_ => {
		onResize()
	})

	// Observe the collapsible portion of the nav
	resizeObserver.observe(nav.getElementsByClassName("nav__collapsible")[0])

	// When component is unmounted
	return () => {
		// Stop observing
		resizeObserver.disconnect()
	}
})

// On navigation
onNavigate(() => {
	// Close the dropdown
	dropdownOpen = false
})

</script>


<div class="nav__wrapper">

	<!-- Create a snippet to render a nav links list item -->
	{#snippet navLinksItem(text: string, href: string, inCollapsible: boolean)}
		<li class="nav__link__wrapper">
			<a href={href}>
				<p class:collapsible-target={inCollapsible}>{text}</p>
			</a>
		</li>
	{/snippet}

	<!-- Bind nav to `nav` so it can be accessed by the script -->
	<nav bind:this={nav}>

		{#if brandContent}
			<a class="nav__brand thinFW" href="/">
				{@render brandContent()}
			</a>
		{/if}

		<div class="nav__collapsible" class:hide={navCollapsed}>
			<ul class="nav__link__list">

				<!-- Create a link for every item in `links` -->
				{#each links as link}
					{@render navLinksItem(link.text, link.href, true)}
				{/each}

			</ul>

			{#if extraContent}
				<div class="collapsible__extra">
					{@render extraContent()}
				</div>
			{/if}

		</div>

		<div class="nav__static">

			{#if staticContent}
				{@render staticContent()}
			{/if}

			<!-- Bind button to `dropdown` so it can be accessed by the script -->
			<button class="static__dropdown-toggle button" type="button" 
				class:hide={!navCollapsed}
				title={dropdownOpen ? "Close Dropdown" : "Open Dropdown"}
				onclick={toggleDropdown}
				bind:this={dropdownButton}
			>

				<!-- Control which svg is displayed in button -->
				{#if dropdownOpen}
					<Close/>
				{:else}
					<Menu/>
				{/if}

			</button>
			
		</div>

	</nav>


	{#if navCollapsed && dropdownOpen}

		<!-- 
			svelte-ignore 
			a11y_click_events_have_key_events,
			a11y_no_static_element_interactions
		-->
		<div class="backdrop--close-dropdown"
			onclick={() => dropdownOpen = false}
			transition:fade={{
				duration: 400,
				easing: quadInOut
			}}
		></div>

		<div class="dropdown" 
			transition:fly={{
				duration: 400,
				easing: quadInOut,
				y: "-100%",
				opacity: 1
			}}
		>

			<ul class="nav__link__list">

				<!-- Create a link for every item in `links` -->
				{#each links as link}
					{@render navLinksItem(link.text, link.href, false)}
				{/each}

			</ul>

			{#if extraContent}
				<div class="dropdown__extra">
					{@render extraContent()}
				</div>
			{/if}

		</div>

	{/if}

</div>


<style lang="scss" scoped>

.nav__wrapper {
	position: relative;
	z-index: 1;


	& > nav {
		--group-gap: 2rem;
		--item-gap: 1rem;

		position: relative;
		padding: 1rem;

		display: flex;
		align-self: stretch;
		justify-content: space-between;

		gap: var(--item-gap);

		background-color: var(--color-bg-3);


		& > .nav__brand {
			display: flex;
			align-items: center;
			justify-content: center;

			color: var(--color-brand-p3);


			& :global(h1),
			& :global(h2),
			& :global(h3),
			& :global(h4),
			& :global(h5),
			& :global(h6),
			& :global(p) {
				font-size: 1.5rem;
				font-weight: var(--font-weight-light);
			}
		}

		& > .nav__collapsible {
			flex-grow: 1;
			overflow: hidden;

			display: flex;
			align-items: stretch;
			justify-content: center;

			gap: var(--group-gap);
			margin-left: calc(var(--group-gap) - var(--item-gap));


			&.hide {
				visibility: hidden;
			}


			& > .nav__link__list {
				flex-grow: 1;

				display: flex;
				align-items: center;
				justify-content: flex-start;

				gap: var(--item-gap);


				& > .nav__link__wrapper {
					height: 100%;

					padding: 0;

					display: flex;
					align-items: center;
					justify-content: center;

					position: relative;

					
					& + .nav__link__wrapper::before {
						content: "";
						position: absolute;

						--size: 1px;
						width: var(--size);
						height: 100%;
						left: calc(-1 * (var(--item-gap) /2 + var(--size) / 2));

						background-color: var(--color-bg-4);
					}


					& > :global(a) {
						transition: color 200ms ease-in-out;

						&:hover {
							color: var(--color-brand-p3);
						}
					}

				}
			}

			& > .collapsible__extra {
				display: flex;
				align-items: center;
				justify-content: flex-start;

				gap: var(--item-gap);
			}
		}

		& > .nav__static {
			display: flex;
			align-items: center;
			justify-content: center;

			gap: var(--item-gap);


			& :global(h1),
			& :global(h2),
			& :global(h3),
			& :global(h4),
			& :global(h5),
			& :global(h6),
			& :global(p) {
				white-space: nowrap;
			}

			& > .static__dropdown-toggle {
				height: 1.5rem;


				&.hide {
					visibility: hidden;
					position: absolute;
					top: 0;
					left: 0;
				}

				& > :global(svg) {
					height: 100%;
				}
			}
		}
	}

	& > .backdrop--close-dropdown {
		position: absolute;
		z-index: -1;
		top: 0;
		left: 0;

		height: 100vh;
		height: 100dvh;
		width: 100%;

		background-color: black;
		opacity: 0.5;
	}

	& > .dropdown {
		position: absolute;
		z-index: -1;

		top: 100%;
		left: 0;
		right: 0;

		background-color: var(--color-bg-3);

		border-style: solid;
		border-color: var(--color-bg-4);
		border-width: 1px 0 1px 0;

		box-shadow: var(--box-shadow-1);


		& > .nav__link__list {

			& > .nav__link__wrapper {
				transition: background-color 200ms ease-in-out;

				&:hover {
					background-color: var(--color-bg-4);
				}

				& > a {
					display: block;
					padding: 1rem;
				}
			}
		}

		& >.dropdown__extra {
			padding: 1rem;

			display: grid;
			gap: 1rem;


			& > :global(.dropdown__button) {
				display: flex;
				align-items: center;
				justify-content: center;
				
				color: var(--color-brand-p4);
				background-color: var(--color-brand-deSat-p1);

				border-radius: 1000rem; // Make pill shape
				padding: 0.125em 0.75em; // Add padding


				transition: background-color 200ms ease-in-out;


				&:hover {
					background-color: var(--color-brand-deSat-p2);
				}
			}
		}
	}
}

</style>