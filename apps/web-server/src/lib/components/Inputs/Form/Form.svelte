<script lang="ts">

// #region Imports

import { enhance, applyAction } from "$app/forms"

// Import components used in this component
import Title from "./Title.svelte"
import Section from "./Section.svelte"
import FButton from "./FormInputs/FButton.svelte"
import FTextInput from "./FormInputs/FTextInput.svelte"


// Import types
import type { Snippet } from "svelte"
import type { ActionResult } from "@sveltejs/kit"

// #endregion Imports



// use:enhance types
interface UseEnhanceEvent {
	formElement: HTMLFormElement,
	formData: FormData,
	action: URL,
	cancel: () => void
	submitter: HTMLElement | null,
	controller: AbortController,
}
interface UseEnhanceCallbackParams {
	result: ActionResult, 
	update: () => Promise<void>
}
type UseEnhanceCallback = (params: UseEnhanceCallbackParams) => Promise<any> | any
type Onsubmit = (event: UseEnhanceEvent, waitingStatus?: boolean) => UseEnhanceCallback



// Reactive state
let waitingForResponse: boolean = $state(false)


// Default subroutine to run on form submission if one is not passed as a prop
let onsubmitDefault: Onsubmit = (event, waitingStatus) => {

	// Update `waitingForResponse` state
	waitingStatus = true


	// Callback when response is returned
	const callback: UseEnhanceCallback = async ({ result, update }) => {
		await update()
		
		// Update `waitingForResponse` state
		waitingStatus = false

		// Update `$page.form`
		await applyAction(result)
	}

	return callback
}



// Get props
interface Props {
	action?: string
	onsubmit?: Onsubmit,
	children?: Snippet<[{ 
		Title: typeof Title,
		Section: typeof Section,
		FButton: typeof FButton,
		FTextInput: typeof FTextInput
	}]>
}
let {
	action = "?", // Default action URL to current route
	onsubmit = onsubmitDefault,
	children
}: Props = $props()

</script>


<div class="form__wrapper" class:loading={waitingForResponse}>
	<form method="POST" {action} use:enhance={(event) => onsubmit(event, waitingForResponse)}>
		{@render children?.({
			Title,
			Section,
			FButton,
			FTextInput 
		})}
	</form>
</div>


<style lang="scss">

.form__wrapper {
	min-width: min(100%, 50ch);
	max-width: 75ch;

	--element-scale: 1;


	& > form {
		background-color: var(--color-bg-3);
		border: var(--border-1);

		--spacing: calc(var(--element-scale) * var(--size-6));
		padding: var(--spacing);
		border-radius: var(--spacing);

		display: grid;
		--gap: var(--spacing);
		gap: var(--gap);


		& > :global(* + *) {
			position: relative;


			&::before {
				content: "";
				position: absolute;

				--size: 1px;
				width: 100%;
				height: 1px;
				top: calc(-1 * (var(--gap) / 2 + var(--size) / 2));

				background-color: var(--color-bg-4);
			}
		}
	}
}

</style>