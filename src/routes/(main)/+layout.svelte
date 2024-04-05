<script>
    // Import styles
    import "$lib/styles/global.scss";

    // Import page to get data from load functions
    import { page } from "$app/stores"

    // Import function to redirect user
    import { goto } from "$app/navigation"

    // Import enhance to prevent hard refeshes after form submitions
    import { enhance } from "$app/forms"

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
        <button class="button-slim" type="button" on:click={() => goto("/settings")}><h6 class="collapsibleTarget">Settings</h6></button>
        <svelte:fragment slot="static">
            {#if $page.data.user}
                <form method="POST" use:enhance>
                    <button class="button-pill" type="submit" formaction="/logout"><h6>Log Out</h6></button>
                </form>
            {:else}
                <button class="button-pill" type="button" on:click={() => goto("/login")}><h6>Log In</h6></button>
            {/if}
        </svelte:fragment>
    </Nav>
    <Notice>
        <h6>Hello! Welcome To My Website... Lorem ipsum dolor sit amet consectetur adipisicing elit.</h6>
    </Notice>
</Header>
<slot/>