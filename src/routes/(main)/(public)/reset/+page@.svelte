<script>
    // Import styles
    import "$lib/styles/global.scss"

    // Import svgs
    import Checkmark from "$lib/assets/svgs/Checkmark.svelte"
    import Close from "$lib/assets/svgs/Close.svelte"

    // Import components
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte"
    
    // https://kit.svelte.dev/docs/modules#$app-stores
    // Import `page` to get page data
    import { page } from "$app/stores"

    // https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
    // "Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads."
    import { enhance } from "$app/forms"

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

</script>

<div class="page">
    {#await $page.data.streamed}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then data} 
        <div class="block loaded" class:valid={form?.status === 200}>
            {#if form?.status === 200}
                <Checkmark/>
                <h4 class="title">Password has been reset</h4>
                <a class="button-pill" href="/"><h5>Return Home</h5></a>
            {:else if data.status === 200}
                <h4 class="title">Reset Your Password</h4>
                <form method="POST" use:enhance>
                    <div>
                        <label for="password"><small>Password*</small></label>
                        <input name="password" id="password" required autocomplete="new-password"
                            class:invalid={form?.errors?.password}
                            placeholder={form?.errors?.password}
                        >
                    </div>
                    <button class="button-pill" type="submit"><h6>Submit</h6></button>
                </form>
            {:else if form?.status !== 200}
                <Close/>
                {#if data.status === 400}
                    <h5>Invalid reset request</h5>
                {:else if data.status === 401}
                    <h5>Reset code expired</h5>
                {:else if data.status === 422}
                    <h5>Incorrect reset code</h5>
                {:else if data.status === 503}
                    <h5>Failed to fetch from database</h5>
                {:else}
                    <h5>Something went wrong</h5>
                {/if}
                <a class="button-pill" href="/"><h5>Return Home</h5></a>
            {/if}
        </div>
    {/await}
</div>

<style lang="scss">
    .page {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;

        padding: 1rem;

        background-color: var(--bg-3);
    }

    .loading {
        width: 10rem;
        color: var(--br-3);
    }

    .block {
        flex-grow: 1;
        max-width: 500px;

        text-align: center;

        >.title {
            font-weight: 600;
        }

        > :global(svg) {
            color: var(--red);
            height: 10rem;
        }

        &.valid > :global(svg) {
            color: var(--green);
        }
    }

    form {
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
</style>