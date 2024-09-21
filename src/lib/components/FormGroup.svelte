<script>
    // #region Imports

    /*
       https://svelte.dev/docs/svelte#onmount
       Subroutine that runs when the component is mounted
    */
    import { onMount } from "svelte"

    /*
        https://kit.svelte.dev/docs/form-actions#progressive-enhancement-use-enhance
        Form action to improve the default behaviour of form elements
    */
    import { enhance } from "$app/forms"
    // #endregion



    // Get `forms` prop from parent
    /**
     * @type {{
            attributes: {
                "": any[]
            },
            inputs: {
                id: String,
                label: {
                    attributes: {
                        "": any[]
                    },
                    text: String
                },
                attributes: {
                    "": any[]
                }
            }[]
        }[]}
     */
    export let forms

    // The width of the widest label in px
    export let labelWidth = 0


    /** @type {HTMLFormElement[]} - The form HTML elements. */
    let formElements = []

    /**
     * @type {HTMLElement[][]} - 2D array of the children of the label elements.
     * - 1st dimension indicates the index of the form it is in.
     * - 2nd dimension indicates the index of the label it is in.
    */
    let labelTexts = []
    for (let i = 0; i < forms.length; i++) labelTexts.push([])



    // Define subroutine to be ran on mount and resize
    const onResize = () => {
        // Calculate widest width of `labelText` items
        labelWidth = Math.max(...[].concat(...labelTexts).map(label => label.clientWidth))
    }

    // When component is mounted
    onMount(() => {
        // Create a resize observer
        const resizeObserver = new ResizeObserver(_ => {
            onResize()
        })

        // Observe the `formElements`
        for (const form of formElements) {
            resizeObserver.observe(form)
        }

        // When component is unmounted
        return () => {
            // Stop observing
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
        {#each form.inputs || [] as input, j}
            <div class="inputContainer">
                <!-- Set width as largest label so all inputs line up -->
                <label 
                    {...input?.label?.attributes} 
                    style="width: {labelWidth}px" 
                    for={input?.id}
                >
                    <!-- Bind h6 to `labelTexts[i][j]` so it can be accessed by the script -->
                    <h6 bind:this={labelTexts[i][j]}>
                        {input?.label?.text}
                    </h6>
                </label>
                <input 
                    {...input?.attributes} 
                    id={input?.id}
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