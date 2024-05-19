<script>
    // Import svgs
    import LogIn from "$lib/assets/svgs/LogIn.svelte"

    // Import components
    import Banner from "$lib/components/Banner.svelte"
    import AutoScroll from "$lib/components/AutoScroll.svelte"

    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
    // "Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads."
    //  https://kit.svelte.dev/docs/modules#$app-forms-applyaction
    // "...updates form and $page.form to result.data (regardless of where you are submitting from, in contrast to update from enhance)"
    import { enhance, applyAction } from "$app/forms"

    // Reactive statements are indicated by the `$:` label
    // https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
    // "Reactive statements run
    //  after other script code
    //  before the component markup is rendered
    //  whenever the values that they depend on have changed."

    // https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action
    // "...the action can respond with data that will be available through the form property"
    // Get data returned from form actions
    $: form = $page.form

    // Reactive statement to indicate which form to show
    $: mode = $page.data.mode
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
                <div class="complete">
                    {#if form}
                        <h4>You have been logged in</h4>
                    {:else}
                        <h4>You are already logged in</h4>
                        <form method="POST" action="/logout" 
                            use:enhance={() => {
                                return async ({ result, update }) => {
                                    await applyAction(result)
                                    update()
                                }
                            }}
                        >
                            <button class="button-pill" type="submit"><h6>Log Out</h6></button>
                        </form>
                    {/if}
                </div>
            {:else}
                <div class="menu">
                    <a href="?mode=login" class="button-slim" class:active={mode === "login"}>
                        <h5>Login</h5>
                    </a>
                    <a href="?mode=register" class="button-slim" class:active={mode === "register"}>
                        <h5>Register</h5>
                    </a>
                </div>
                <div class="forms">
                    {#if mode === "login"}
                        <form method="POST" action="?/login" use:enhance>
                            <h5 class="title">Log In To Your Account</h5>
                            <div>
                                <label for="email"><small>Email Address*</small></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors?.email}
                                    placeholder={form?.errors?.email}
                                >
                            </div>
                            <div>
                                <label for="password"><small>Password*</small></label>
                                <input name="password" id="password" required autocomplete="current-password"
                                    class:invalid={form?.errors?.password}
                                    placeholder={form?.errors?.password}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h6>Login</h6></button>
                        </form>
                    {:else if mode === "register"}
                        <form method="POST" action="?/register" use:enhance>
                            <h5 class="title">Create A New Account</h5>
                            <div>
                                <label for="username"><small>Username*</small></label>
                                <input name="username" id="username" required autocomplete="username"
                                    class:invalid={form?.errors?.username}
                                    placeholder={form?.errors?.username}
                                >
                            </div>
                            <div>
                                <label for="email"><small>Email Address*</small></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors?.email}
                                    placeholder={form?.errors?.email}
                                >
                            </div>
                            <div>
                                <label for="password"><small>Password*</small></label>
                                <input name="password" id="password" required autocomplete="new-password"
                                    class:invalid={form?.errors?.password}
                                    placeholder={form?.errors?.password}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h6>Register</h6></button>
                        </form>
                    {:else if mode === "reset"}
                        <form method="POST" action="?/reset" use:enhance>
                            <h5 class="title">Reset Your Password</h5>
                            <div>
                                <label for="email"><small>Email Address*</small></label>
                                <input name="email" id="email" required autocomplete="email"
                                    class:invalid={form?.errors?.email}
                                    placeholder={form?.errors?.email}
                                >
                            </div>
                            <button class="button-pill" type="submit"><h6>Reset</h6></button>
                        </form>
                    {/if}
                </div>
                <a href="?mode=reset" class="button-slim" class:active={mode === "reset"}>
                    <h6>Forgot your password?</h6>
                </a>
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
        flex-grow: 1;
        max-width: 500px;

        >.complete {
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

                >.title {
                    text-align: center;
                }

                label {
                    margin-left: 2px;
                    color: var(--tx-4);
                    font-weight: 300;
                    display: flex;
                    text-align: left;
                }
                input {
                    width: 100%;
                }
            }
        }

        >a {
            align-self: center;
        }
    }

</style>