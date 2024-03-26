<script>
    export let links

    import Close from "$lib/assets/svgs/Close.svelte"
    import Menu from "$lib/assets/svgs/Menu.svelte";
    import { onMount } from "svelte"

    let collapsible
    let collapsed = true
    let dropdown = false

    const onResize = () => {
        let gapSize = 16
        let dropdownButtonSize = 22

        let containerWidth = collapsible.clientWidth
        let navItems = [...collapsible.getElementsByTagName("h2")]
        let contentWidth = navItems.reduce((total, item) => total + item.clientWidth, 0)
        let spacingWidth = gapSize * (navItems.length -1)   
        let staticDifference = (dropdownButtonSize) * collapsed
        collapsed = (contentWidth + spacingWidth > containerWidth + staticDifference)
        dropdown = collapsed ? dropdown : false
    }

    const toggleDropdown = () => {
        dropdown = !dropdown
    }

    onMount(() => {
        onResize()
        window.addEventListener("resize", onResize)
    })



</script>

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
                        <h2>{link.text}</h2>
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
        {#if collapsed}
            <button class="dropdown-button button-slim" type="button" on:click={toggleDropdown}
                title={dropdown? "close dropdown":"open dropdown"}
            >
            {#if dropdown}
                <Close/>
            {:else}
                <Menu/>
            {/if}
            </button>
        {/if}
    </div>
    {#if collapsed && dropdown}
        <div class="dropdown">
            <ul class="navLinks">
                {#each links as link}
                    <li class="navLink">
                        <a href={link.href}>
                            <h2>{link.text}</h2>
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
</nav>

<style lang="scss">

    nav {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: space-between;

        padding-top: 0.75rem;
        padding-bottom: 0.75rem;

        background-color: var(--bg-3);
        color: var(--tx-1);

        >.brand {
            margin-right: 1rem;

            display: flex;
            align-items: center;

            color: var(--br-3);
            font-size: 2rem;
            font-weight: 100;
        }

        >.collapse {
            overflow: hidden;

            flex: 1 1 auto;

            display: flex;
            align-items: center;
            gap: 1rem;

            &.collapsed {
                >* {
                    visibility: hidden;
                }
            }

            >.navLinks {
                margin-left: auto;
                margin-right: auto;
                
                display: flex;
                gap: 1rem;

                font-size: 1rem;
                font-weight: 400;

                >.navLink {
                    padding: 0;

                    transition: color 200ms ease-in-out;
                    &:hover {
                        color: var(--br-3);
                    }
                }
            }

            >.extra {
                >:global(button) {
                    font-size: 1rem;
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

                >:global(svg) {
                    height: 100%;
                }
            }

            >:global(button) {
                font-size: 1rem;
            }
        }

        >.dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;

            background-color: var(--bg-3);
            color: var(--tx-1);

            border: solid var(--bg-4);
            border-width: 1px 0 0 0;

            >.navLinks {
                font-size: 1rem;

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
    }

</style>