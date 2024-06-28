<script lang="ts">
	import Level_Scene from '$lib/earbetter/Level_Scene.svelte';
	import {get_app} from '$lib/earbetter/app.js';

	const app = get_app();

	const {level, exit_level, register_success, selected_project_data} = $derived(app);

	const level_stats = $derived($selected_project_data?.level_stats);
</script>

<svelte:head>
	<title>Earbetter trainer level</title>
</svelte:head>

<main>
	<button title="go back" class="go_back icon_button plain_button" onclick={app.exit_level}
		>←</button
	>
	{#if $level && level_stats}
		<div class="level">
			<Level_Scene level={$level} {level_stats} {exit_level} {register_success} />
		</div>
	{:else}
		<div class="box h_100">
			<p>
				No level found, <button onclick={app.exit_level}>go back</button> to the map.
			</p>
		</div>
	{/if}
</main>

<style>
	main,
	:global(html, body) {
		width: 100%;
		height: 100%;
	}

	.level {
		width: 100%;
		height: 100%;
	}

	.go_back {
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
