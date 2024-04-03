<script>
    // Import svgs
    import Close from "$lib/assets/svgs/Close.svelte"
    import Menu from "$lib/assets/svgs/Menu.svelte";

    // Import function to handle lifecycle events
    import { onMount } from "svelte"

    // Import function to handle navigation events
    import { onNavigate } from "$app/navigation"

    // Let links be passed to component as prop
    export let links

    // The html element containing collapsible content
    let collapsible

    // The html element that toggles the dropdown
    let dropdownButton

    // Variables indicating collapsible and dropdown state
    let collapsed = true
    let dropdown = false

    // Define function to be ran on mount and resize
    const onResize = () => {
        // Get width of the collapsible container
        const containerWidth = collapsible.clientWidth

        // Get width of dropdown toggle button
        const dropdownButtonWidth = dropdownButton.clientWidth

        // Get all items in collapsible container
        // IMPROVE: Get elements by class name so tag does not matter
        const collapsibleItems = [...collapsible.getElementsByTagName("h6")]
        
        // Calculate total width of all items in "collapsibleItems"
        const totalItemWidth = collapsibleItems.reduce((total, item) => total + item.clientWidth, 0)

        // Get gap between items in "collapsible"
        const collapsibleGap = Number(window.getComputedStyle(collapsible).columnGap.slice(0,-2))

        // Calculate the extra spacing required to fit all items in "collapsibleItems"
        const spacingWidth = collapsibleGap * (collapsibleItems.length -1)   

        // Calcualte the extra width taken up by elements that only appear when "collapsed == true"
        // "collapsed" will be [ true or flase ] therefore static difference will be [ 0 or {dropdownButtonWidth} ]
        const staticDifference = (dropdownButtonWidth) * collapsed

        // Set boolean to control "collapsible" is collapsed
        collapsed = (containerWidth + staticDifference < totalItemWidth + spacingWidth)

        // "dropdown" = it's current value if collapsed is true or false if collapsed is false
        // This logic closes the dropdown if there is enough space for collaspible div,
        // meaning the dropdown is no longer necessary
        dropdown = collapsed ? dropdown : false
    }

    // Define function to toggle "dropdown"
    const toggleDropdown = () => {
        dropdown = !dropdown
    }

    // When component is mounted, get inital value for "collapsed"
    onMount(() => {
        onResize()
    })

    onNavigate(() => {
        dropdown = false
    })
</script>

<!-- Add an event listener to call "onResize" function -->
<svelte:window on:resize={onResize}/>

<div class="zIndex">
    <nav>
        {#if $$slots.brand}
            <a class="brand" href="/">
                <slot name="brand"/>
            </a>
        {/if}
        <div class="collapse" class:collapsed={collapsed} bind:this={collapsible}>
            <ul class="navLinks">
                {#each links as link}
                    <li class="navLink">
                        <a href={link.href}>
                            <h6>{link.text}</h6>
                        </a>
                    </li>
                {/each}
            </ul>
            {#if $$slots.default}
                <div class="extra">
                    <slot/>
                </div>
            {/if}
        </div>
        <div class="static" class:collapsed={collapsed}>
            {#if $$slots.static}
                <slot name="static"/>
            {/if}
            <button class="dropdown-button button-slim" class:collapsed={!collapsed} type="button" 
                title={dropdown ? "Close dropdown":"Open dropdown"}
                on:click={toggleDropdown}
                bind:this={dropdownButton}
            >
            {#if dropdown}
                <Close/>
            {:else}
                <Menu/>
            {/if}
            </button>
            
        </div>
    </nav>
    {#if collapsed && dropdown}
    <div class="dropdown">
        <ul class="navLinks">
            {#each links as link}
                <li class="navLink">
                    <a href={link.href}>
                        <h6>{link.text}</h6>
                    </a>
                </li>
            {/each}
        </ul>
        {#if $$slots.default}
            <div class="extra">
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
        position: relative;
        padding: 0 0.75rem;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding-top: 0.75rem;
        padding-bottom: 0.75rem;

        background-color: var(--bg-3);

        >.brand {
            margin-right: 1rem;

            display: flex;
            align-items: center;

            color: var(--br-3);
            font-weight: 300;
        }

        >.collapse {
            overflow: hidden;

            flex: 1 1 auto;

            display: flex;
            align-items: center;
            column-gap: 1rem;

            &.collapsed {
                >* {
                    visibility: hidden;
                }
            }

            >.navLinks {
                flex: 1;
                display: flex;
                justify-content: center;
                gap: 1rem;

                >.navLink {
                    padding: 0;

                    transition: color 200ms ease-in-out;
                    &:hover {
                        color: var(--br-3);
                    }
                }
            }
        }

        >.static {
            padding: 0rem 0;
            margin-left: 1rem;

            display: flex;
            align-items: center;
            gap: 1rem;

            &.collapsed {
                margin-left: 0;
            }

            >.dropdown-button {
                height: 1.5rem;

                &.collapsed {
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

                :global(button) {
                    background-color: var(--sc-1);
                    color: var(--br-4);
                    padding: 0.5em 1em;
                    border-radius: 1000px;

                    transition: background-color 200ms ease-in-out;
                    &:hover {
                        color: var(--br-4);
                        background-color: var(--sc-2);
                    }
                }
            }
        }

</style>