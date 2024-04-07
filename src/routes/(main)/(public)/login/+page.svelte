<script>
    // Import page to get data from load functions
    import { page } from "$app/stores"

    // Import notice store
    import { notice } from "$lib/stores/notice"

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

    // Get data returned from form action events
    export let form

    // Reactive variable to control what form to show
    $: mode = $page.data.mode

    // IMPROVE: Figure out how to get form data from form 
    // actions that are on a different route (/logout),
    // So that notices from that action can be set

    // Set the notice if the form action returns one
    $: notice.set(form?.notice)
    
    // TODO: "forgot password?" option
</script>

<Banner>
    <LogIn slot="svg"/>
    <h4>Login</h4>
    <AutoScroll>
        <h6>Log In To An Existing Account Or Create One</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="pageContent">
        <div class="block">
            {#if $page.data.user}
                <div class="loggedIn">
                    {#if form}
                        <h4>You have been logged in</h4>
                    {:else}
                        <h4>You are already logged in</h4>
                        <form method="POST" action="/logout" use:enhance>
                            <button class="button-pill" type="submit"><h6>Log Out</h6></button>
                        </form>
                    {/if}
                </div>
            {:else}
                <div class="menu">
                    <button class="button-slim" type="button"
                        class:active={(mode || "login") === "login"}
                        on:click={() => {goto("?mode=login")}}
                    >
                        <h5>Login</h5>
                    </button>
                    <button class="button-slim" type="button"
                        class:active={(mode || "login") === "register"}
                        on:click={() => {goto("?mode=register")}}
                    >
                        <h5>Register</h5>
                    </button>
                </div>
                <div class="forms">
                    {#if (mode || "login") === "login"}
                        <form method="POST" action="?/login" use:enhance>
                            <h5>Log In To Your Account</h5>
                            <div>
                                <label for="email"><small>Email Address*</small></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors.email}
                                    placeholder={form?.errors.email}
                                >
                            </div>
                            <div>
                                <label for="password"><small>Password*</small></label>
                                <input name="password" id="password" required autocomplete="current-password"
                                    class:invalid={form?.errors.password}
                                    placeholder={form?.errors.password}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h6>Login</h6></button>
                        </form>
                    {:else if (mode || "login") === "register"}
                        <form method="POST" action="?/register" use:enhance>
                            <h5>Create A New Account</h5>
                            <div>
                                <label for="username"><small>Username*</small></label>
                                <input name="username" id="username" required autocomplete="username"
                                    class:invalid={form?.errors.username}
                                    placeholder={form?.errors.username}
                                >
                            </div>
                            <div>
                                <label for="email"><small>Email Address*</small></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors.email}
                                    placeholder={form?.errors.email}
                                >
                            </div>
                            <div>
                                <label for="password"><small>Password*</small></label>
                                <input name="password" id="password" required autocomplete="new-password"
                                    class:invalid={form?.errors.password}
                                    placeholder={form?.errors.password}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h6>Register</h6></button>
                        </form>
                    {/if}
                </div>
                <button class="button-slim">
                    <h6>Forgot your password?</h6>
                </button>
            {/if}
        </div>
    </div>
</div>

<style lang="scss">

    .pageContent {
        height: 100%;

        flex-direction: row;
        align-items: center;
        justify-content: center;
    }

    .block {
        flex: 1;
        max-width: 500px;

        >.loggedIn {
            display: grid;
            gap: 1rem;
            justify-content: center;

            text-align: center;
            font-weight: 600;
        
            >form {
                display: grid;
            }
        }

        >.menu {
            display: flex;
            gap: 1rem;
        }

        >.forms {
            >form {
                display: grid;
                grid-auto-flow: row;
                gap: 1rem;

                label {
                    color: var(--tx-4);
                    font-weight: 300;
                }
                input {
                    width: 100%;
                }
            }
        }
    }

</style>