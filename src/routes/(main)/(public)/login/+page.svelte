<script>
    // Import page to get data from load functions
    import { page } from "$app/stores"

    // Import goto to change url params
    import { goto } from "$app/navigation"

    // Import enhance to prevent hard refeshes after form submitions
    // and to add extra data to forms
    import { enhance } from "$app/forms"

    // Import svgs
    import LogIn from "$lib/assets/svgs/LogIn.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"

    // Allows access to data returned from server action events
    export let form

    // Reactive variable to control what form to show
    $: mode = $page.data.mode
</script>

<Banner>
    <LogIn slot="svg"/>
    <h1>Login</h1>
    <AutoScroll>
        <h2>Log In To An Existing Account Or Create One</h2>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="pageContent">
        <div class="block">
            {#if $page.data.session}
                <div class="loggedIn">
                    {#if form}
                        <h1>You have been logged in</h1>
                    {:else}
                        <h1>You are already logged in</h1>
                        <form method="POST">
                            <button class="button-pill" type="submit" formaction="/logout"><h2>Log Out</h2></button>
                        </form>
                    {/if}
                </div>
            {:else}
                <div class="tabs">
                    <button class="button-slim" type="button"
                        class:active={(mode || "login") === "login"}
                        on:click={() => {goto("?mode=login")}}
                    >
                        <h2>Login</h2>
                    </button>
                    <button class="button-slim" type="button"
                        class:active={(mode || "login") === "register"}
                        on:click={() => {goto("?mode=register")}}
                    >
                        <h2>Register</h2>
                    </button>
                </div>
                <div class="centered">
                    {#if (mode || "login") === "login"}
                        <form class="form" method="POST" 
                            use:enhance={({ formData }) => { formData.append("mode","login") }}
                        >
                            <h1>Log In To Your Account</h1>
                            <div>
                                <label for="email"><h3>Email Address*</h3></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors.email}
                                    placeholder={form?.errors.email}
                                >
                            </div>
                            <div>
                                <label for="password"><h3>Password*</h3></label>
                                <input name="password" id="password" required autocomplete="current-password"
                                    class:invalid={form?.errors.password}
                                    placeholder={form?.errors.password}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h2>Login</h2></button>
                        </form>
                    {:else if (mode || "login") === "register"}
                        <form class="form" method="POST"
                            use:enhance={({ formData }) => { formData.append("mode","register") }}
                        >
                            <h1>Create A New Account</h1>
                            <div>
                                <label for="username"><h3>Username*</h3></label>
                                <input name="username" id="username" required autocomplete="username"
                                    class:invalid={form?.errors.username}
                                    placeholder={form?.errors.username}
                                >
                            </div>
                            <div>
                                <label for="email"><h3>Email Address*</h3></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors.email}
                                    placeholder={form?.errors.email}
                                >
                            </div>
                            <div>
                                <label for="password"><h3>Password*</h3></label>
                                <input name="password" id="password" required autocomplete="new-password"
                                    class:invalid={form?.errors.password}
                                    placeholder={form?.errors.password}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h2>Register</h2></button>
                        </form>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">

    .pageContent {
        height: 100%;

        align-items: center;
        justify-content: center;
    }

    .block {
        width: 75%;
        min-width: fit-content;
        min-width: -moz-fit-content;
        max-width: 40rem;

        height: max-content;

        .tabs {
            display: flex;
            gap: 1rem;
        }

        .form {
            display: grid;
            grid-auto-flow: row;
            gap: 1rem;

            input {
                width: 100%;

                padding-top: 2px;
                padding-left: 2px;

                background: none;
                border-width: 0 0 1px 0 !important;
                border: solid var(--tx-4);
                border-radius: 0;

                font-family: inherit;
                font-size: inherit;
                color: inherit;
                font-weight: 400;

                text-align: left;
                // Or center?
                // What looks better?

                transition: border-color 200ms ease-in-out;
                &.invalid {
                    border-color: var(--red);
                }
                &:valid {
                    border-color: var(--tx-4);
                }
                &:focus {
                    outline: none;
                    border-color: var(--br-3);
                }

                &:-webkit-autofill,
                &:-webkit-autofill:hover, 
                &:-webkit-autofill:focus, 
                &:-webkit-autofill:active{
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: var(--tx-1);
                }
            }
        }

        h1 {
            font-size: 1.25rem;
            font-weight: 600;
        }
        h2 {
            font-size: 1rem;
        }
        h3 {
            font-size: 0.75rem;
            color: var(--tx-4);
            font-weight: 600;
        }
    }

    .loggedIn {
        display: grid;
        gap: 1rem;
        justify-content: center;

        text-align: center;

        h1 {
            font-size: 1.5rem;
            font-weight: 600;
        }

        form {
            display: grid;
        }
    }

    .centered {
        width: 75%;
        min-width: fit-content;
        min-width: -moz-fit-content;
        max-width: 50%;

        margin-inline: auto;
    }

</style>