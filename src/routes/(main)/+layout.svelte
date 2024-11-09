<script>
    // #region Imports
    
    // Import components
    import Header from "$lib/components/Header/Header.svelte"

    /*
        https://kit.svelte.dev/docs/modules#$app-stores-page
        Store containing page information
    */
    import { page } from "$app/stores"

    /*
        `enhance`:
            https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
            Form action to improve the default behaviour of form elements.

        `applyAction`:
            https://kit.svelte.dev/docs/modules#$app-forms-applyaction
            Subroutine to update the `$page.form` property even if form 
            action is on another route.
    */
    import { enhance, applyAction } from "$app/forms"

    // Import notice store
    import { notice } from "$lib/stores/notice.js"
    // #endregion 



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
        Get data from load subroutines
    */
    $: data = $page.data

    // Set the notice if a load subroutine returns one
    $: if (data.notice) notice.set(data.notice)


    /*
        https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action
        Get data from form actions
    */
    $: form = $page.form

    // Set the notice if the form action returns one
    $: if (form?.notice) notice.set(form?.notice)
</script>

<!-- Make child components usable -->
<Header let:Nav let:Notice>
    <Nav links={[
        {
            text: "Home",
            href: "/"
        },
        {
            text: "Friends",
            href: "/friends"
        },
        {
            text: "Lorem",
            href: "/"
        },
        {
            text: "Lorem",
            href: "/"
        },
        {
            text: "Lorem",
            href: "/"
        }
    ]}>
        <!-- Pass children to `brand` slot -->
        <svelte:fragment slot="brand">
            <h2>OhMe</h2>
        </svelte:fragment>

        <!-- Pass to `default` slot -->
        <a class="button-slim" href="/settings">
            <h6 class="collapsibleTarget">Settings</h6>
        </a>

        <!-- Pass children to `static` slot -->
        <svelte:fragment slot="static">
            <!-- If client is logged in -->
            {#if data.user}
                <!-- Display a "Log Out" button -->
                <form method="POST" action="/logout"
                    use:enhance={() => {
                        return async ({ result, update }) => {
                            await applyAction(result)
                            await update()
                        }
                    }}
                >
                    <button class="button-pill" type="submit"><h6>Log Out</h6></button>
                </form>

            <!-- Else -->
            {:else}
                <!-- Display a "Log in" button -->
                <a class="button-pill" href="/login"><h6>Log In</h6></a>
            {/if}
        </svelte:fragment>
    </Nav>
    <Notice/>
</Header>

<!-- Children go here -->
<slot/>