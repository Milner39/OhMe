<script>
    // Import svgs
    import Close from "$lib/assets/svgs/Close.svelte"
    import Menu from "$lib/assets/svgs/Menu.svelte"

    // https://svelte.dev/docs/svelte-transition
    // Import transitions and easing functions
    import { fly, fade } from "svelte/transition"
    import { quadInOut } from "svelte/easing"

    // https://svelte.dev/docs/svelte#onmount
    // onMount: runs a function as soon as component has been mounted on the DOM
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // https://kit.svelte.dev/docs/modules#$app-navigation-onnavigate
    // onNavigate: runs a function before navigation to a new URL
    // Import function to handle navigation events
    import { onNavigate } from "$app/navigation"

    // Get `links` prop from parent
    export let links

    // The nav html element
    let nav

    // The html element that toggles the dropdown
    let dropdownButton

    // Variables indicating collapsed and dropdown state
    let collapsed = true
    let dropdown = false

    // Define function to be ran on mount and resize
    const onResize = () => {
        // Get element containing collapsible content
        const collapseEl = nav.getElementsByClassName("collapse")[0]

        // Get element containing the nav links
        const navLinksEl = collapseEl.getElementsByClassName("navLinks")[0]

        // Get element containing extra elements
        const extraEl = collapseEl.getElementsByClassName("extra")[0]

        // Get element containing static elements
        const staticEl = nav.getElementsByClassName("static")[0]

        // Get width of `collapse`
        const containerWidth = collapseEl.clientWidth

        // Get all elements with the "collapsibleTarget" class in `collapse`
        const collapsibleItems = [...collapseEl.getElementsByClassName("collapsibleTarget")]
        
        // Calculate total width of all items in `collapsibleItems`
        const totalItemWidth = collapsibleItems.reduce((total, item) => total + item.clientWidth, 0)

        // Get gap between `navLinks` and `static`
        const collapsibleGap = Number(window.getComputedStyle(collapseEl).columnGap.slice(0,-2))

        // Get gap between items in `navLinks`
        const navLinksGap = Number(window.getComputedStyle(navLinksEl).columnGap.slice(0,-2))

        // Get gap between items in `extra`
        const extraGap = Number(window.getComputedStyle(extraEl).columnGap.slice(0,-2))

        // Calculate the extra spacing required to fit all items in `collapsibleItems`
        const spacingWidth = collapsibleGap + (navLinksGap * (navLinksEl.childElementCount -1)) + (extraGap * (extraEl.childElementCount -1))

        // Get gap between items in `static`
        const staticGap = Number(window.getComputedStyle(staticEl).columnGap.slice(0,-2))

        // Get width of `dropdownButton`
        const dropdownButtonWidth = dropdownButton.clientWidth

        // Calculate the extra width taken up by elements that only appear when `collapsed === true`
        // `collapsed` will be [ `true` or `false` ] therefore static difference will be [ somePixels or 0 ]
        const staticDifference = (staticGap + dropdownButtonWidth) * collapsed

        // Set boolean to control `collapsible` is collapsed
        collapsed = (containerWidth + staticDifference < totalItemWidth + spacingWidth)

        // If `collapsed === true`:
        //   set `dropdown` to its current value
        // If  `collapsed === false`:
        //   set `dropdown` to `false`
        // This logic closes the dropdown if there is enough space for `collapsible`,
        // meaning the dropdown can be closed
        dropdown = collapsed ? dropdown : false
    }

    // When component is mounted
    onMount(() => {
        // Create a resize observer
        const resizeObserver = new ResizeObserver(_ => {
            // Run resize function
            onResize()
        })

        // Observe the `collapsible` element
        resizeObserver.observe(nav.getElementsByClassName("collapse")[0])

        // When component is unmounted
        return () => {
            // Unobserve all elements
            resizeObserver.disconnect()
        }
    })

    // On navigation
    onNavigate(() => {
        // Close the dropdown
        dropdown = false
    })

    // Define function to toggle `dropdown`
    const toggleDropdown = () => {
        dropdown = !dropdown
    }
</script>

<div class="zIndex">
    <!-- Bind nav to `nav` so it can be accessed by the script -->
    <nav bind:this={nav}>
        <!-- If the `brand` slot was passed in -->
        {#if $$slots.brand}
            <a class="brand" href="/">
                <!-- Children in `brand` slot go here -->
                <slot name="brand"/>
            </a>
        {/if}
        <div class="collapse" class:hide={collapsed}>
            <ul class="navLinks">
                <!-- Create a link for every item in `links` -->
                {#each links as link}
                    <li class="navLink">
                        <a href={link.href}>
                            <h6 class="collapsibleTarget">{link.text}</h6>
                        </a>
                    </li>
                {/each}
            </ul>
            <!-- If a slot was passed in -->
            {#if $$slots.default}
                <div class="extra">
                    <!-- Other children go here -->
                    <slot/>
                </div>
            {/if}
        </div>
        <div class="static">
            <!-- If the `static` slot was passed in -->
            {#if $$slots.static}
                <!-- Children in `static` slot go here -->
                <slot name="static"/>
            {/if}
            <!-- Bind button to `dropdown` so it can be accessed by the script -->
            <button class="dropdown-button button-slim" class:hide={!collapsed} type="button" 
                title={dropdown ? "Close dropdown" : "Open dropdown"}
                on:click={toggleDropdown}
                bind:this={dropdownButton}
            >
                <!-- Control which svg is displayed in button -->
                {#if dropdown}
                    <Close/>
                {:else}
                    <Menu/>
                {/if}
            </button>
            
        </div>
    </nav>
    <!-- If `collapsed` and `dropdown` are true: display dropdown -->
    {#if collapsed && dropdown}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div class="dropdown-closeArea"
            on:click={() => dropdown = false}
            transition:fade={{
                duration: 400,
                easing: quadInOut,
                opacity: 1
            }}
        />
        <div class="dropdown" 
            transition:fly={{
                duration: 400,
                easing: quadInOut,
                y: "-100%",
                opacity: 1
            }}
        >
            <ul class="navLinks">
                <!-- Create a link for every item in `links` -->
                {#each links as link}
                    <li class="navLink">
                        <a href={link.href}>
                            <h6>{link.text}</h6>
                        </a>
                    </li>
                {/each}
            </ul>
            <!-- If a slot was passed in -->
            {#if $$slots.default}
                <div class="extra">
                    <!-- Other children go here -->
                    <slot/>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">

    .zIndex {
        position: relative;
        z-index: 1;
    }

    nav {
        --group-gap: 2rem;
        --item-gap: 1rem;

        position: relative;
        padding: 1rem;

        display: flex;
        align-self: stretch;
        justify-content: space-between;

        gap: var(--item-gap);

        background-color: var(--bg-3);

        >.brand {
            display: flex;
            align-items: center;
            justify-content: center;

            color: var(--br-3);
            font-weight: 300;
        }

        >.collapse {
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

            >.navLinks {
                flex-grow: 1;

                display: flex;
                align-items: center;
                justify-content: flex-start;

                gap: var(--item-gap);

                >.navLink {
                    height: 100%;

                    padding: 0;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    >:global(a) {
                        transition: color 200ms ease-in-out;
                        &:hover {
                            color: var(--br-3);
                        }
                    }

                    position: relative;
                    & + .navLink::before {
                        content: "";
                        position: absolute;

                        // Blue dots
                        // --size: 0.25rem;
                        // width: var(--size);
                        // aspect-ratio: 1/1;
                        // border-radius: 1000px;
                        // left: calc(-1 * (var(--item-gap) /2 + var(--size) / 2));

                        // background-color: var(--br-3);

                        // Gray lines
                        --size: 1px;
                        width: var(--size);
                        height: 100%;
                        left: calc(-1 * (var(--item-gap) /2 + var(--size) / 2));

                        background-color: var(--bg-4);
                    }
                }
            }

            >.extra {
                display: flex;
                align-items: center;
                justify-content: flex-start;

                gap: var(--item-gap);
            }
        }

        >.static {
            display: flex;
            align-items: center;
            justify-content: center;

            gap: var(--item-gap);

            >.dropdown-button {
                height: 1.5rem;

                &.hide {
                    visibility: hidden;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                >:global(svg) {
                    height: 100%;
                }
            }
        }
    }

    .dropdown-closeArea {
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

    .dropdown {
            position: absolute;
            z-index: -1;

            top: 100%;
            left: 0;
            right: 0;

            background-color: var(--bg-3);

            border: solid var(--bg-4);
            border-width: 1px 0 1px 0;

            box-shadow: var(--box-shadow-1);

            >.navLinks {

                >.navLink {
                    transition: background-color 200ms ease-in-out;
                    &:hover {
                        background-color: var(--bg-4);
                    }

                    >a {
                        display: block;
                        padding: 1rem;
                    }
                }
            }

            >.extra {
                padding: 1rem;

                display: grid;
                gap: 1rem;

                :global(.button-slim) {
                    background-color: var(--sc-1);
                    color: var(--br-4);

                    padding: 0.5em 1em;
                    border-radius: 1000px;

                    transition: background-color 200ms ease-in-out;
                    &:hover {
                        color: var(--br-4);
                        background-color: var(--sc-2);
                    }

                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }

</style>