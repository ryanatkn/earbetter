<script lang="ts">
	import type {LevelStore, LevelStoreState} from './level';

	export let level: LevelStore;

	// TODO colors
	const get_bg_color = ($level: LevelStoreState, index: number) => {
		return $level.status === 'complete'
			? 'rgba(255, 255, 255, 0.6)'
			: $level.trials[index] // trials are created when needed, not ahead of time
			? $level.trial && index === $level.trial.index
				? 'rgba(255, 255, 255, 0.4)'
				: 'rgba(255, 255, 255, 0.2)'
			: 'transparent';
	};
</script>

<div class="level-progress-indicator">
	{#each {length: $level.def.trial_count} as _, index}
		<div class="level" style="background-color: {get_bg_color($level, index)}" />
	{/each}
</div>

<style>
	.level-progress-indicator {
		display: flex;
		width: 100%;
		height: 100%;
	}
	.level {
		flex: 1;
		border: var(--border_width) var(--border_style) var(--border_color);
	}
</style>
