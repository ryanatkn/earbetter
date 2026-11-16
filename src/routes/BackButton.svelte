<script lang="ts">
	import type {Snippet} from 'svelte';

	interface Props {
		title?: string;
		onclick: () => void;
		children?: Snippet;
	}

	const {title = 'go back', onclick, children}: Props = $props();
</script>

<button type="button" {title} class="icon_button plain_button" {onclick}>
	{#if children}
		{@render children()}
	{:else}
		←
	{/if}
</button>

<style>
	button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		font-size: var(--font_size_xl3);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		/* TODO same as var(--level_progress_height); */
		height: 50px;
		width: 50px;
		line-height: 1;
	}
</style>
