<script>
    // Import styles
    import "$lib/styles/global.scss"

    // Import components
    import Header from "$lib/components/Header/Header.svelte"

    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import page to get data from load functions
    import { page } from "$app/stores"

    // https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
    // "Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads."
    //  https://kit.svelte.dev/docs/modules#$app-forms-applyaction
    // "...updates form and $page.form to result.data (regardless of where you are submitting from, in contrast to update from enhance)"
    import { enhance, applyAction } from "$app/forms"
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
            <!-- If `$page.data.user` is defined -->
            {#if $page.data.user}
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