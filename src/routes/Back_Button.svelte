<script lang="ts">
	interface Props {
		title?: string;
		onclick: () => void;
	}

	const {title = 'go back', onclick}: Props = $props();
</script>

<button {title} class="icon_button plain_button" {onclick}> ← </button>

<style>
	button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		font-size: var(--size_xl3);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		/* TODO same as var(--level_progress_height); */
		height: 50px;
		width: 50px;
		line-height: 1;
	}
</style>
