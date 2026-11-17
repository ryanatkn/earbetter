<script lang="ts">
	import Alert from '@fuzdev/fuz_ui/Alert.svelte';

	import LevelScene from '#lib/earbetter/LevelScene.svelte';
	import { app_context } from '#lib/earbetter/app.svelte.ts';
	import BackButton from '#routes/BackButton.svelte';

	const app = app_context.get();

	const level_stats = $derived(app.selected_project_data?.level_stats);
</script>

<svelte:head>
	<title>Earbetter trainer level</title>
</svelte:head>

<main>
	<BackButton onclick={app.exit_level} />
	{#if app.level?.error}
		<div class="box height:100%">
			<Alert status="error">this level can't be played: {app.level.error}</Alert>
			<p>
				<button type="button" onclick={app.exit_level}>go back</button> to the map to edit it.
			</p>
		</div>
	{:else if app.level && level_stats}
		<div class="level">
			<!-- keyed so a new level, like from back/forward between levels, gets a fresh scene that starts it -->
			{#key app.level}
				<LevelScene level={app.level} {level_stats} exit_level={app.exit_level} />
			{/key}
		</div>
	{:else}
		<div class="box height:100%">
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
