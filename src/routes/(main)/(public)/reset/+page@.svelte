<script>
    // #region Imports

    // Import svgs
    import Checkmark from "$lib/assets/svgs/Checkmark.svelte"
    import Close from "$lib/assets/svgs/Close.svelte"

    // Import components
    import LoadingAnimation from "$lib/components/LoadingAnimation.svelte"
    
    /*
        https://kit.svelte.dev/docs/modules#$app-stores-page
        Store containing page information
    */
    import { page } from "$app/stores"

    /*
        https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
        Form action to improve the default behaviour of form elements
    */
    import { enhance } from "$app/forms"
    // #endregion



    /*
        Reactive statements are indicated by the `$:` label
        https://svelte.dev/docs/svelte-components#script-3-$-marks-a-statement-as-reactive
        "Reactive statements run:
         - after other script code
         - before the component markup is rendered
         - whenever the values that they depend on have changed."
    */

    /*
        https://kit.svelte.dev/docs/load#$page-data
        Get data from load subroutines
    */
    $: data = $page.data

    /*
        https://kit.svelte.dev/docs/form-actions#anatomy-of-an-action
        Get data from form actions
    */
    $: form = $page.form

</script>

<div class="page">
    {#await data.checkResetCode}
        <div class="loading">
            <LoadingAnimation/>
        </div>
    {:then resetCode} 
        <div class="block loaded" class:valid={form?.status === 200}>
            {#if form}
                {#if form?.status === 200}
                    <Checkmark/>
                    <h4 class="thickFW">Password has been reset</h4>
                    <a class="button-pill" href="/"><h5>Return Home</h5></a>
                {:else}
                    <Close/>
                    <h5>{form?.errors?.client || "Something went wrong, try again later..."}</h5>
                    <a class="button-pill" href="/"><h5>Return Home</h5></a>
                {/if}
            {:else if resetCode.status === 200}
                <h4 class="thickFW">Reset Your Password</h4>
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
            {:else}
                <Close/>
                <h5>{resetCode.errors?.client || "Something went wrong, try again later..."}</h5>
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