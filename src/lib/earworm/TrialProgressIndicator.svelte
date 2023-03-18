<script lang="ts">
	import type {LevelStore, LevelStoreState} from '$lib/earworm/level';

	// TODO should we hoist some logic so this just takes a trial?
	export let level: LevelStore;

	$: current_index = $level.trial
		? $level.trial.presenting_index === null
			? $level.trial.guessing_index
			: $level.trial.presenting_index
		: null;

	// TODO colors
	const get_bg_color = ($level: LevelStoreState, index: number): string =>
		$level.status === 'complete'
			? 'rgba(255, 255, 255, 0.6)'
			: index === current_index
			? 'rgba(255, 255, 255, 0.4)'
			: current_index !== null && index < current_index
			? 'rgba(255, 255, 255, 0.2)'
			: 'transparent';
</script>

{#if $level.trial}
	<div class="trial-progress-indicator">
		{#each {length: $level.trial.sequence.length} as _, index}
			<div class="trial" style="background-color: {get_bg_color($level, index)}" />
		{/each}
	</div>
{/if}

<style>
	.trial-progress-indicator {
		display: flex;
		width: 100%;
		height: 100%;
	}
	.trial {
		flex: 1;
		border: var(--border_width) var(--border_style) var(--border_color);
	}
</style>
