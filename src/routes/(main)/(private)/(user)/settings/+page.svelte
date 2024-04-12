<script>
    // Import svgs
    import Settings from "$lib/assets/svgs/Settings.svelte"
    import Edit from "$lib/assets/svgs/Edit.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import FormGroup from "$lib/components/FormGroup.svelte"

    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import page to get data from load functions
    import { page } from "$app/stores"

    // https://svelte.dev/docs/svelte#onmount
    // onMount: runs a function as soon as component has been mounted on the DOM
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // Import notice store
    import { notice } from "$lib/stores/notice"

    // https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action
    // "...the action can respond with data that will be available through the form property"
    // Get data returned from form actions
    export let form

    // The width in pixels that indicates when the widescreen style change should occur
    let wideModeSize = 850
    // The width of the html element containing the page content
    let contentWidth
    // The html element containing the forms on wide screens
    let scrollForms
    // A boolean indicating if a scroll bar on the `scrollForms` element is shown
    let formScrollBar = false

    // Variable to indicate what form group is shown on wide screens
    let selectedFormGroup = 0

    // Define function to be ran on mount and resize
    const onResize = () => {
        // If `contentWidth` is smaller than `wideModeSize`: exit the function
        if (contentWidth <= wideModeSize) {return}
        // Set the `formScrollBar` to `true` if a scrollbar is shown
        formScrollBar = scrollForms.clientHeight < scrollForms.scrollHeight
    }

    // When component is mounted
    onMount(() => {
        // Run resize function
        onResize()

        // Create a resize observer
        const resizeObserver = new ResizeObserver(_ => {
            // Run resize function
            onResize()
        })

        // Observe the `scrollForms` element
        resizeObserver.observe(scrollForms)

        // When component is unmounted
        return () => {
            // Unobserve all elements
            resizeObserver.disconnect()
        }
    })

    // Define a function to shrink strings to fit in input placeholder
    const shrinkString = (string) => {
        // If `string` contains less than 16 chars: exit the function
        if (string.length < 16) {return string} 
        // Return a concatenated string
        return (string.slice(0,8) + "..." + string.slice(-8))
    }

    // Reactive statements are indicated by the `$:` label
    // https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
    // "Reactive statements run
    //  after other script code
    //  before the component markup is rendered
    //  whenever the values that they depend on have changed."

    // Reactive statement to set the notice if the form action returns one
    $: notice.set(form?.notice)

    // Reactive statement to update the `user` variable when `$page.data.user` changes
    $: user = $page.data.user

    // Reactive statement to control the content of form groups
    $: FORM_GROUPS = [
        {
            title: {
                text: "Account Information",
                svg: Edit
            },
            forms: [
                {
                    attributes: {
                        action: "?/username"
                    },
                    inputs: [
                        {
                            id: "username",
                            label: {
                                attributes: {},
                                text: "Username:"
                            },
                            attributes: {
                                name: "username",
                                required: true,
                                autocomplete: "username",
                                class: form?.errors?.username ? "invalid" : "",
                                placeholder: form?.errors?.username || shrinkString(user?.username)
                            }
                        }
                    ]
                },
                {
                    attributes: {
                        action: "?/email"
                    },
                    inputs: [
                        {
                            id: "email",
                            label: {
                                attributes: {},
                                text: "Email Address:"
                            },
                            attributes: {
                                name: "email",
                                required: true,
                                autocomplete: "email",
                                class: form?.errors?.email ? "invalid" : "",
                                placeholder: form?.errors?.email || shrinkString(user?.email.address)
                            }
                        }
                    ]
                },
                {
                    attributes: {
                        action: "?/password",
                    },
                    inputs: [
                        {
                            id: "password",
                            label: {
                                attributes: {},
                                text: "Current Password:"
                            },                        
                            attributes: {
                                name: "password",
                                required: true,
                                autocomplete: "current-password",
                                class: form?.errors?.password ? "invalid" : "",
                                placeholder: form?.errors?.password || "Current Password"
                            }
                        },
                        {
                            id: "newPassword",
                            label: {
                                attributes: {},
                                text: "Set New Password:"
                            },
                            attributes: {
                                name: "newPassword",
                                required: true,
                                autocomplete: "new-password",
                                class: form?.errors?.newPassword ? "invalid" : "",
                                placeholder: form?.errors?.newPassword || "New Password"
                            }
                        },
                    ]
                }
            ]
        },
        {
            title: {
                text: "Payments",
                svg: Edit
            },
            forms: [
                {

                }
            ]
        }
    ]
</script>

<Banner>
    <Settings slot="svg"/>
    <h4>Settings</h4>
    <AutoScroll>
        <h6>View And Change Account Settings</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <!-- Bind div's clientWidth to `contentWidth` so it can be accesed by the script -->
    <div class="pageContent" bind:clientWidth={contentWidth}>
        <!-- Display the widescreen version of the layout if `contentWidth` is wider than `wideModeSize`  -->
        {#if contentWidth > wideModeSize}
            <div class="block wide">
                <ul class="scrollMenu">
                    <!-- Create a title for every item in `FORM_GROUPS` -->
                    {#each FORM_GROUPS as group, i}
                        <li class="title" class:active={selectedFormGroup === i}>
                            <button on:click={() => {selectedFormGroup = i}}>
                                <h5>{group.title?.text}</h5>
                                <svelte:component this={group.title?.svg}/>
                            </button>
                        </li>
                    {/each}
                </ul>
                <!-- Bind div to `scrollForms` so it can be accesed by the script -->
                <div class="scrollForms" bind:this={scrollForms} class:pullScrollBar={formScrollBar}>
                    <!-- Pass the `forms` prop as the selected index of `FORM_GROUPS` -->
                    <FormGroup forms={FORM_GROUPS[selectedFormGroup].forms}/>
                </div>
            </div>
        {:else}
            <!-- Create a form group for every item in `FORM_GROUPS` -->
            {#each FORM_GROUPS as group}
                <div class="block">
                    <div class="title">
                        <h5>{group.title?.text}</h5>
                        <svelte:component this={group.title?.svg}/>
                    </div>
                    <FormGroup forms={group.forms}/>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style lang="scss">

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        :global(svg) {
            height: 1.25em;
        }
    }

    .page:has(.block.wide) {
        height: 0;
        min-height: 250px;
    }

    .pageContent:has(.block.wide) {
        height: 100%;
    }

    .block.wide {
        padding: 0;
        gap: 0;

        height: 100%;
        overflow: hidden;

        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto 1fr;

        >.scrollMenu {
            display: flex;
            flex-direction: column;

            border: solid var(--bg-4);
            border-width: 0 1px 0 0;

            overflow-y: auto;
            overflow-x: hidden;
            
            >.title {
                transition: color 200ms ease-in-out;
                &.active {
                    color: var(--br-3);
                }

                >button {
                    width: 100%;
                
                    padding: 1rem;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;

                    white-space: nowrap;

                    transition: background-color 200ms ease-in-out;
                    &:hover {
                        background-color: var(--bg-4);
                    }
                }
            }

            &::-webkit-scrollbar {
                width: 2.5rem;
            }
            &::-webkit-scrollbar-track {
                background-color: transparent;
            }
            &::-webkit-scrollbar-thumb {
                background-color: var(--bg-4);
                border-radius: 1000px;
                border: 1rem solid var(--bg-3);
            }
        }

        >.scrollForms {
            padding: 1rem;

            display: flex;
            flex-direction: column;
            gap: 1rem;

            overflow-y: auto;

            &.pullScrollBar {
                padding-right: 0;
            }

            &::-webkit-scrollbar {
                width: 2.5rem;
            }
            &::-webkit-scrollbar-track {
                background-color: transparent;
            }
            &::-webkit-scrollbar-thumb {
                background-color: var(--bg-4);
                border-radius: 1000px;
                border: 1rem solid var(--bg-3);
            }
        }
    }

</style>