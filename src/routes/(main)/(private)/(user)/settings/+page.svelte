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

    // Reactive variables to display user data
    $: user = $page.data.user

    // Define a function to shrink strings to fit in input placeholder
    const shrinkString = (string) => {
        if (string.length < 18) {
            return string
        } 
        return (string.slice(0,8) + "..." + string.slice(-8))
    }

    // Get data returned from form action events
    export let form

    // Set the notice if the form action returns one
    $: if (form) {
        notice.set(form.notice)
    }
</script>

<Banner>
    <Settings slot="svg"/>
    <h4>Settings</h4>
    <AutoScroll>
        <h6>View And Change Account Settings</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="pageContent">
        <div class="block">
            <FormGroup forms={[
                {
                    attributes: {
                        method: "POST",
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
                                class: form?.errors.username ? "invalid" : "",
                                placeholder: form?.errors.username || shrinkString(user.username)
                            }
                        }
                    ]
                },
                {
                    attributes: {
                        method: "POST",
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
                                class: form?.errors.email ? "invalid" : "",
                                placeholder: form?.errors.email || shrinkString(user.email)
                            }
                        }
                    ]
                },
                {
                    attributes: {
                        method: "POST",
                        action: "?/password"
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
                                class: form?.errors.password ? "invalid" : "",
                                placeholder: form?.errors.password || "Current Password"
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
                                class: form?.errors.newPassword ? "invalid" : "",
                                placeholder: form?.errors.newPassword || "New Password"
                            }
                        },
                    ]
                }
            ]}>
                <svelte:fragment slot="title">
                    <h5>Account Information</h5>
                    <Edit/>
                </svelte:fragment>
            </FormGroup>
        </div>
        <div class="block">
            <div class="blockTitle">
                <h5>Payments</h5>
                <Edit/>
            </div>
        </div>
    </div>
</div>

<style lang="scss">

    .blockTitle {
        display: flex;
        align-items: center;
        gap: 1rem;

        width: -moz-fit-content;
        width: fit-content;

        :global(svg) {
            height: 1.25em;
        }
    }

</style>