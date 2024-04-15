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

<div class="content">
    {#await $page.data.streamed}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then data} 
        <div class="loaded" class:valid={form?.status === 200}>
            {#if form?.status === 200}
                <Checkmark/>
            {:else if data.status !== 200}
                <Close/>
            {/if}
            <div class="block">
                {#if form?.status === 200}
                    <h4>Password has been reset</h4>
                {:else if data.status === 200}
                    <form method="POST" use:enhance>
                        <h5 class="title">Reset Your Password</h5>
                        <div>
                            <label for="password"><small>Password*</small></label>
                            <input name="password" id="password" required autocomplete="new-password"
                                class:invalid={form?.errors?.password}
                                placeholder={form?.errors?.password}
                            >
                        </div>
                    </form>
                {:else if data.status === 400}
                    <h4>Invalid reset request</h4>
                {:else if data.status === 401}
                    <h4>Reset code expired</h4>
                {:else if data.status === 422}
                    <h4>Incorrect reset code</h4>
                {:else if data.status === 503}
                    <h4>Failed to fetch from database</h4>
                {/if}
                {#if form?.status === 200 || data.status !== 200}
                    <a class="button-pill" href="/"><h5>Return Home</h5></a>
                {/if}
            </div>
        </div>
    {/await}
</div>

<style lang="scss">
    .content {
        width: 100vw;
        height: 100%;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        padding: 1rem;

        text-align: center;
        
        background-color: var(--bg-3);
    }

    .loading {
        width: 10rem;
        color: var(--br-3);
    }

    .loaded {
        display: flex;
        flex-direction: column;
        gap: 1rem;

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
</style>