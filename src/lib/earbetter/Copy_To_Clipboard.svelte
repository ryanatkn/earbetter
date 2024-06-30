<script lang="ts">
	import type {Snippet} from 'svelte';

	// TODO refactor with `Copy_To_Clipboard.svelte` from Fuz

	interface Props {
		text: string;
		oncopy?: () => void;
		children?: Snippet;
	}

	const {text, oncopy, children}: Props = $props();
</script>

<button
	type="button"
	class="my_lg"
	onclick={() => {
		void navigator.clipboard.writeText(text);
		oncopy?.();
	}}
>
	{#if children}
		{@render children()}
	{:else}
		copy to clipboard
	{/if}
</button>
