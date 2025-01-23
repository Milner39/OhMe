<script lang="ts">

// #region Imports

// Import types
import type { Snippet } from "svelte"
import type { FullAutoFill } from "svelte/elements"

// #endregion Imports


// Get props
interface Props {
	classes?: string,
	name: string,
	placeholder?: string,
	required?: boolean,
	autocomplete?: FullAutoFill,
	secure?: boolean,
	labelContent?: Snippet,
	inputBoxContent?: Snippet,
	helperContent?: Snippet
}
let {
	classes,
	name,
	placeholder,
	required = false,
	autocomplete = "off",
	secure = false,
	labelContent,
	inputBoxContent,
	helperContent,
}: Props = $props()

</script>


<label class={"form__text-input__label " + (classes ?? "")}>
	{@render labelContent?.()}
	<div class="form__text-input__wrapper">
		<input type={!secure ? "text" : "password"}
			{name} {placeholder} {required} {autocomplete}
		>
		{@render inputBoxContent?.()}
	</div>
	{@render helperContent?.()}
</label>


<style lang="scss">

.form__text-input__label {
	
	& > .form__text-input__wrapper {
		border: var(--border-1);
		border-radius: calc(var(--element-scale) * var(--size-2));
		padding: 0.25em 0.5em;

		display: flex;
		gap: calc(var(--element-scale) * var(--size-4));


		& > input {
			flex-grow: 1;


			&::placeholder {
				color: var(--color-txt-4);
			}
		}
	}
}

</style>