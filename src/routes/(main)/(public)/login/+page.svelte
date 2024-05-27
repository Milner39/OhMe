<script>
    // Import svgs
    import LogIn from "$lib/assets/svgs/LogIn.svelte"
    import Checkmark from "$lib/assets/svgs/Checkmark.svelte"

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

    // TODO: hide passwords while typing, use button to toggle show password
</script>

<Banner>
    <LogIn slot="svg"/>
    <h4>Login</h4>
    <AutoScroll>
        <h6>Log in or register an account.</h6>
    </AutoScroll>
</Banner>

<div class="page">
    <div class="widthCtrl">
        <div class="block" class:success={$page.data.user && form} class:returned={$page.data.user && !form}>
            {#if $page.data.user}
                {#if form}
                    <Checkmark/>
                    <h4 class="title">Success</h4>
                    <h6>You have logged into your account. You can continue using the app as normal now.</h6>
                    <a class="button-pill" href="/">
                        <h6>Home</h6>
                    </a>
                {:else}
                    <h4 class="title">Logout?</h4>
                    <h6>You are already logged into your account. You can logout here or continue to use the app as normal.</h6>
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
            {:else}
                <h4 class="title">
                    {
                    mode === "login" ? "Login" :
                    mode === "register" ? "Register" :
                    "Reset Password"
                    }
                </h4>
                {#if mode === "login"}
                    <h6>Enter your account details below.</h6>
                    <form class="form" method="POST" action="?/login" use:enhance>
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
                        <button class="button-pill" type="submit"><h6>Log In</h6></button>
                    </form>
                    <a href="?mode=reset" class="button-pill button-alt">
                        <h6>Forgot password</h6>
                    </a>
                    <h6>Don't have an account yet?</h6>
                    <a href="?mode=register" class="button-slim">
                        <h6>Register</h6>
                    </a>
                {:else if mode === "register"}
                    <h6>Enter your email address and choose a password.</h6>
                    <form class="form" method="POST" action="?/register" use:enhance>
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
                    <h6>Have an account already?</h6>
                    <a href="?mode=login" class="button-slim">
                        <h6>Login</h6>
                    </a>
                {:else if mode === "reset"}
                    <h6>Sent a password reset link via email.</h6>
                    <form class="form" method="POST" action="?/reset" use:enhance>
                        <div>
                            <label for="email"><small>Email Address*</small></label>
                            <input name="email" id="email" required autocomplete="email"
                                class:invalid={form?.errors?.email}
                                placeholder={form?.errors?.email}
                            >
                        </div>
                        <button class="button-pill" type="submit"><h6>Reset</h6></button>
                    </form>
                    <a href="?mode=login" class="button-pill button-alt">
                        <h6>Cancel</h6>
                    </a>
                {/if}
            {/if}
        </div>
    </div>
</div>

<style lang="scss">

    .page {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
    }

    .block {
        flex-grow: 1;
        max-width: 500px;

        text-align: center;

        >.title {
            font-weight: 600;
        }

        &.success {
            >a {
                width: 100%;
            }

            >:global(svg) {
                height: 5rem;
                color: var(--green);
            }
        }

        &.returned {
            >form>button {
                width: 100%;
            };
        }

        >.form {
            display: grid;
            grid-auto-flow: row;
            gap: 1rem;

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

</style>