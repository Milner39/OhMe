<script>
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // Import enhance to prevent hard refeshes after form submitions
    import { enhance } from "$app/forms"

    // Prop containing settings used to create forms
    export let forms

    // The form html elements
    let formElements = []
    // The child of each label html elements
    let labelTexts = []
    // The width of the widest label
    export let labelWidth = 0

    // When component is mounted, get inital value for "labelWidth"
    onMount(() => {
        labelWidth = labelTexts.reduce((max, label) => max = Math.max(max, label.clientWidth), 0)
    })
</script>

<!-- Add an event listener to update label width on resize -->
<svelte:window 
    on:resize={() => {
        labelWidth = labelTexts.reduce((max, label) => max = Math.max(max, label.clientWidth), 0)
    }}
/>

<div class="title">
    <slot name="title"/>
</div>
{#each forms as form, i}
    <form 
        {...form.attributes} 
        bind:this={formElements[i]} 
        use:enhance
    >
        {#each form.inputs as input, j}
            <div class="inputContainer">
                <label 
                    {...input.label.attributes} 
                    style="width: {labelWidth}px" 
                    for={input.id}
                >
                    <h6 
                        bind:this={labelTexts[j]}
                    >
                        {input.label.text}
                    </h6>
                </label>
                <input 
                    {...input.attributes} 
                    id={input.id}
                    on:keypress={(e) => {
                        // Form with multiple inputs wont submit by default on "Enter"
                        if (e.key === "Enter") {
                            e.preventDefault()
                            formElements[i].requestSubmit()
                        }
                    }}

                >
            </div>
        {/each}
    </form>
{/each}

<style lang="scss">

    .title {
        display: flex;
        align-items: center;
        gap: 1rem;

        width: -moz-fit-content;
        width: fit-content;

        :global(svg) {
            height: 1.25em;
        }
    }

    form {
        border-radius: 1rem;
        border: solid 1px var(--bg-4);

        padding: 1rem;

        display: flex;
        flex-direction: column;

        row-gap: 1rem;

        .inputContainer {
            display: flex;
            flex-wrap: wrap;

            align-items: center;

            column-gap: 1rem;
            row-gap: 0.1rem;

            >label {
                text-wrap: nowrap;
                white-space: nowrap;
                >* {
                    width: min-content;
                }
            }

            >input {
                flex-grow: 1;
                margin-left: auto;

                max-width: 40ch;
                min-width: 15ch;
                // Inputs have a default "size" property that gives it a width of ~100px
                // It must be overriden by setting a width
                width: 0;
            }
        }
    }

</style>