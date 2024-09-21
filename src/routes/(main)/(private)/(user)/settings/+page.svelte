<script>
    // #region Imports

    // Import svgs
    import Settings from "$lib/assets/svgs/Settings.svelte"
    import Edit from "$lib/assets/svgs/Edit.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"
    import FormGroup from "$lib/components/FormGroup.svelte"
    import SidebarPane from "$lib/components/SidebarPane.svelte"

    /*
        https://kit.svelte.dev/docs/modules#$app-stores-page
        Store containing page information
    */
    import { page } from "$app/stores"
    // #endregion



    /*
        The width in pixels that indicates when the 
        widescreen style change should occur.
    */
    let wideModeSize = 850

    /*
        The width in pixels of the html element 
        containing the page content.
    */
    let contentWidth = 0

    /*
        Variable to indicate what form group is shown 
        on wide screens.
    */
    let selectedFormGroup = 0


    /*
        IMPROVE: Find a more graceful way to do this 
        without hard coding max lengths. Maybe move this
        process to the `FormGroup` component.
    */
    // Define a subroutine to shrink strings to fit in input placeholder
    const shrinkString = (string) => {
        // If `string` contains less than 16 chars, exit the function
        if (string.length < 16) return string
        // Return a concatenated string
        return (string.slice(0,8) + "..." + string.slice(-8))
    }



    /*
        Reactive statements are indicated by the `$:` label
        https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
        "Reactive statements run:
         - after other script code
         - before the component markup is rendered
         - whenever the values that they depend on have changed."
    */

    /*
        https://kit.svelte.dev/docs/load#$page-data
        Get user data from load subroutines
    */
    $: user = $page.data.user

    /*
        https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action
        Get data from form actions
    */
    $: form = $page.form


    /*
        Object to control the content of each `FormGroup` component.
        Since a reactive declaration is used, if the values that
        the object depend on change, so will the values in this object.
    */
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
        <h6>Manage account and accessibility settings.</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <!-- Bind div's clientWidth to `contentWidth` so it can be accessed by the script -->
    <div class="widthCtrl" bind:clientWidth={contentWidth}>
        <!-- Display the widescreen version of the layout if `contentWidth` is wider than `wideModeSize`  -->
        {#if contentWidth > wideModeSize}
            <div class="block wide">
                <!-- Bind `selectedPane` to `selectedFormGroup` so it can be accessed by the script -->
                <SidebarPane bind:selectedPane={selectedFormGroup} sideItemCount={FORM_GROUPS.length}>
                    <svelte:fragment slot="sidebar" let:index>
                        <h5>{FORM_GROUPS[index].title?.text}</h5>
                        <svelte:component this={FORM_GROUPS[index].title?.svg}/>
                    </svelte:fragment>
                    <!-- Re-render the component if `selectedFormGroup` changes -->
                    {#key selectedFormGroup}
                        <FormGroup forms={FORM_GROUPS[selectedFormGroup].forms}/>
                    {/key}
                </SidebarPane>
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

    .page {
        display: flex;
        align-items: center;
        justify-content: baseline;
        
        flex-direction: column;
        gap: 1rem;
    }

    .page:has(.block.wide) {
        height: 0;
        min-height: 250px;

        >.widthCtrl {
            height: 100%;
        }
    }

    .block {
        width: 100%;
    }

    .block.wide {
        height: 100%;
        padding: 0;
        gap: 0;
        overflow: hidden;
    }

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;

        :global(svg) {
            height: 1.25em;
        }
    }

</style>