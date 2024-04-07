<script>
    // Import page to get data from load functions
    import { page } from "$app/stores"

    // Import notice store
    import { notice } from "$lib/stores/notice"

    // Import svgs
    import Settings from "$lib/assets/svgs/Settings.svelte"
    import Edit from "$lib/assets/svgs/Edit.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import FormGroup from "$lib/components/FormGroup.svelte"

    // Get data returned from form action events
    export let form

    // Reactive variables to display user data
    $: user = $page.data.user

    // Variables to control styles
    let contentWidth
    let wideModeSize = 850
    let scrollForms
    let formScrollBar
    // Function to run on resize
    const onResize = () => {
        if (contentWidth <= wideModeSize) {return}
        formScrollBar = scrollForms.clientHeight < scrollForms.scrollHeight
    }

    // Define a function to shrink strings to fit in input placeholder
    const shrinkString = (string) => {
        if (string.length < 16) {
            return string
        } 
        return (string.slice(0,8) + "..." + string.slice(-8))
    }

    // Variable to control what form group is shown
    let selectedGroup = 0
    // Reactive variable to control content of form groups
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
                                placeholder: form?.errors?.email || shrinkString(user?.email)
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

    // Set the notice if the form action returns one
    $: notice.set(form?.notice)
</script>

<Banner>
    <Settings slot="svg"/>
    <h4>Settings</h4>
    <AutoScroll>
        <h6>View And Change Account Settings</h6>
    </AutoScroll>
</Banner>

<svelte:window on:resize={onResize}/>

<div class="page">
    <div class="pageContent" bind:clientWidth={contentWidth}>
        {#if contentWidth > wideModeSize}
            <div class="block wide">
                <ul class="scrollMenu">
                    {#each FORM_GROUPS as group, i}
                        <li class="title" class:active={selectedGroup === i}>
                            <button on:click={() => {selectedGroup = i}}>
                                <h5>{group.title?.text}</h5>
                                <svelte:component this={group.title?.svg}/>
                            </button>
                        </li>
                    {/each}
                </ul>
                <div class="scrollForms" bind:this={scrollForms} class:pullScrollBar={formScrollBar}>
                    <FormGroup forms={FORM_GROUPS[selectedGroup].forms}/>
                </div>
            </div>
        {:else}
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

                    text-wrap: nowrap;
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