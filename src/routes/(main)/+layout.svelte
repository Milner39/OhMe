<script>
    // Import styles
    import "$lib/styles/global.scss";

    // Import page to get data from load functions
    import { page } from "$app/stores"

    // Import enhance to prevent hard refeshes after form submitions
    import { enhance, applyAction } from "$app/forms"

    // Import components
    import Header from "$lib/components/Header/Header.svelte"
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
        <svelte:fragment slot="brand">
            <h2>OhMe</h2>
        </svelte:fragment>
        <a class="button-slim" href="/settings"><h6 class="collapsibleTarget">Settings</h6></a>
        <svelte:fragment slot="static">
            {#if $page.data.user}
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
            {:else}
                <a class="button-pill" href="/login"><h6>Log In</h6></a>
            {/if}
        </svelte:fragment>
    </Nav>
    <Notice/>
</Header>
<slot/>