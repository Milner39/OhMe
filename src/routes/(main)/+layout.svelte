<script>
    // Import styles
    import "$lib/styles/global.scss";

    // Import function to redirect user
    import { goto } from "$app/navigation"

    // Import components
    import Header from "$lib/components/Header/Header.svelte"
</script>

<!-- Make child components usable -->
<Header let:Nav let:Notice>
    <Nav links={[
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
        },
        {
            text: "Lorem",
            href: "/"
        }
    ]}>
        <svelte:fragment slot="brand">
            <h1>OhMe</h1>
        </svelte:fragment>
        <button class="button-slim" type="button" on:click={() => goto("/settings")}><h2>Settings</h2></button>
        <svelte:fragment slot="static">
            <button class="button-pill" type="button" on:click={() => goto("/login")}><h2>Log In</h2></button>
        </svelte:fragment>
    </Nav>
    <Notice>
        <h3>Hello! Welcome To My Website... Lorem ipsum dolor sit amet consectetur adipisicing elit.</h3>
    </Notice>
</Header>
<slot/>