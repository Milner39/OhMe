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
        <button>Login</button>
        <svelte:fragment slot="static">
            <button>Join</button>
        </svelte:fragment>
    </Nav>
    <Notice>
        <h1>Alert Here</h1>
    </Notice>
</Header>
<slot/>