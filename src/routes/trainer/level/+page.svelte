<script lang="ts">
	import Level_Scene from '$lib/earbetter/Level_Scene.svelte';
	import {get_app} from '$lib/earbetter/app.svelte.js';
	import Back_Button from '$routes/Back_Button.svelte';

	const app = get_app();

	const level_stats = $derived(app.selected_project_data?.level_stats);
</script>

<svelte:head>
	<title>Earbetter trainer level</title>
</svelte:head>

<main>
	<Back_Button onclick={app.exit_level} />
	{#if app.level && level_stats}
		<div class="level">
			<Level_Scene level={app.level} {level_stats} exit_level={app.exit_level} />
		</div>
	{:else}
		<div class="box h_100">
			<p>
				No level found, <button type="button" onclick={app.exit_level}>go back</button> to the map.
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
</style>
