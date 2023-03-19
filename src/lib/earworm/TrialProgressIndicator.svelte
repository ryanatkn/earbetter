<script lang="ts">
	import type {Level, Status} from '$lib/earworm/level';

	export let level: Level;

	$: ({trial, status} = level);

	$: current_index = $trial
		? $trial.presenting_index === null
			? $trial.guessing_index
			: $trial.presenting_index
		: null;

	// TODO colors
	const get_bg_color = (s: Status, index: number): string =>
		s === 'complete'
			? 'rgba(255, 255, 255, 0.6)'
			: index === current_index
			? 'rgba(255, 255, 255, 0.4)'
			: current_index !== null && index < current_index
			? 'rgba(255, 255, 255, 0.2)'
			: 'transparent';
</script>

{#if $trial}
	<div class="trial-progress-indicator">
		{#each {length: $trial.sequence.length} as _, index}
			<div class="trial" style="background-color: {get_bg_color($status, index)}" />
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
