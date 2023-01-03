<script lang="ts">
	import type {LevelStore, LevelStoreState} from '$lib/tuneup/level';

	// TODO should we hoist some logic so this just takes a trial?
	export let level: LevelStore;

	$: currentIndex = $level.trial
		? $level.trial.presentingIndex === null
			? $level.trial.guessingIndex
			: $level.trial.presentingIndex
		: null;

	// TODO colors
	const getBgColor = ($level: LevelStoreState, index: number): string =>
		$level.status === 'complete'
			? 'rgba(255, 255, 255, 0.6)'
			: index === currentIndex
			? 'rgba(255, 255, 255, 0.4)'
			: currentIndex !== null && index < currentIndex
			? 'rgba(255, 255, 255, 0.2)'
			: 'transparent';
</script>

{#if $level.trial}
	<div class="trial-progress-indicator">
		{#each {length: $level.trial.sequence.length} as _, index}
			<div class="trial" style="background-color: {getBgColor($level, index)}" />
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
