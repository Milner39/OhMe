<script>
    // https://svelte.dev/docs/svelte#onmount
    // onMount: runs a function as soon as component has been mounted on the DOM
    // Import functions to handle lifecycle events
    import { onMount } from "svelte"

    // https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
    // "Without an argument, use:enhance will emulate the browser-native behaviour, just without the full-page reloads."
    import { enhance } from "$app/forms"

    // Get `forms` prop from parent
    export let forms

    // The form html elements
    let formElements = []

    // The child of each label html element in 2D array
    let labelTexts = []
    for (let i = 0; i < forms.length; i++) {labelTexts.push([])}

    // The width of the widest label
    export let labelWidth = 0

    // Define function to be ran on mount and resize
    const onResize = () => {
        // Calculate widest width of labels
        labelWidth = Math.max(...[].concat(...labelTexts).map(label => label.clientWidth))
    }

    // When component is mounted
    onMount(() => {
        // Create a resize observer
        const resizeObserver = new ResizeObserver(_ => {
            // Run resize function
            onResize()
        })

        // Observe the `formElements` elements
        for (const form of formElements) {
            resizeObserver.observe(form)
        }

        // When component is unmounted
        return () => {
            // Unobserve all elements
            resizeObserver.disconnect()
        }
    })
</script>

<!-- Create a form for every item in `forms` -->
{#each forms as form, i}
    <!-- Bind form to `formElements[i]` so it can be accessed by the script -->
    <form
        {...form.attributes} 
        bind:this={formElements[i]} 
        method="POST"
        use:enhance
    >
        <!-- Create a label and input for every item in `form.inputs` -->
        {#each form?.inputs || [] as input, j}
            <div class="inputContainer">
                <!-- Set width as largest label so all inputs line up -->
                <label 
                    {...input.label?.attributes} 
                    style="width: {labelWidth}px" 
                    for={input.id}
                >
                    <!-- Bind h6 to `labelTexts[i][j]` so it can be accessed by the script -->
                    <h6 bind:this={labelTexts[i][j]}>
                        {input.label?.text}
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

    form {
        border-radius: 0.5rem;
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
                // It must be overridden by setting a width
                width: 0;
            }
        }
    }

</style>