<script>
    // Import styles
    import "$lib/styles/global.scss"

    // Import components
    import Header from "$lib/components/Header/Header.svelte"

    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
    // "Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads."
    //  https://kit.svelte.dev/docs/modules#$app-forms-applyaction
    // "...updates form and $page.form to result.data (regardless of where you are submitting from, in contrast to update from enhance)"
    import { enhance, applyAction } from "$app/forms"

    // Import notice store
    import { notice } from "$lib/stores/notice"

    // Reactive statements are indicated by the `$:` label
    // https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
    // "Reactive statements run
    //  after other script code
    //  before the component markup is rendered
    //  whenever the values that they depend on have changed."

    // https://kit.svelte.dev/docs/load#$page-data
    // "...has access to its own data plus all the data from its parents."
    // Get data from load functions
    $: data = $page.data

    // Reactive statement to set the notice if the load functions return one
    $: if (data.notice) notice.set(data.notice)


    // https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action
    // "...the action can respond with data that will be available through the form property"
    // Get data returned from form actions
    $: form = $page.form

    // Reactive statement to set the notice if the form action returns one
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
        <a class="button-slim" href="/settings"><h6 class="collapsibleTarget">Settings</h6></a>
        <!-- Pass children to `static` slot -->
        <svelte:fragment slot="static">
            <!-- If `data.user` is defined -->
            {#if data.user}
                <!-- Display a "Log Out" button -->
                <form method="POST"
                    use:enhance={() => {
                        return async ({ result, update }) => {
                            await applyAction(result)
                            update()
                        }
                    }}
                >
                    <button class="button-pill" type="submit" formaction="/logout"><h6>Log Out</h6></button>
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