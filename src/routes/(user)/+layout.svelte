<script>
    import "$lib/styles/global.scss";

    import Header from "$lib/components/Header/Header.svelte"
</script>

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
        },
        {
            text: "Settings",
            href: "/settings"
        },
    ]}>
        <svelte:fragment slot="brand">
            <h1>OhMe</h1>
        </svelte:fragment>
        <button class="button-slim" type="button"><h2>Login</h2></button>
        <svelte:fragment slot="static">
            <button class="button-pill" type="button"><h2>Join Now</h2></button>
        </svelte:fragment>
    </Nav>
    <Notice>
        <h3>Hello! Welcome To My Website... Lorem ipsum dolor sit amet consectetur adipisicing elit.</h3>
    </Notice>
</Header>
<slot/>