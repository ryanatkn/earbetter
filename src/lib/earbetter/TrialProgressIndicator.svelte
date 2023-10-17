<script lang="ts">
	import {fade} from 'svelte/transition';

	import type {Level, Status} from '$lib/earbetter/level';

	export let level: Level;

	$: ({trial, status} = level);

	$: current_index = $trial
		? $trial.presenting_index === null
			? $trial.guessing_index
			: $trial.presenting_index
		: null;

	const to_bg_color = (s: Status, index: number, current_index: number | null): string =>
		s === 'showing_failure_feedback'
			? 'transparent'
			: s === 'complete' || s === 'showing_success_feedback'
			? 'var(--lighten_4)'
			: index === current_index
			? 'var(--lighten_3)'
			: current_index !== null && index < current_index
			? 'var(--lighten_2)'
			: 'transparent';

	$: percent_complete =
		$status === 'initial' || $status === 'showing_failure_feedback'
			? 0
			: $status === 'complete' || $status === 'showing_success_feedback'
			? 1
			: $trial?.presenting_index != null
			? ($trial.presenting_index + 0.5) / $trial.sequence.length
			: $trial?.guessing_index != null
			? ($trial.guessing_index + 0.5) / $trial.sequence.length
			: 0;
</script>

{#if $trial}
	<div
		class="trial-progress-indicator"
		style:--progress_bar_percent={percent_complete}
		transition:fade|local
	>
		{#each {length: $trial.sequence.length} as _, index}
			<div class="trial" style="background-color: {to_bg_color($status, index, current_index)}" />
		{/each}
		<div class="progress-bar" />
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
		background-color: transparent;
		transition: background-color linear var(--duration_3);
	}
	.progress-bar {
		--progress_bar_duration: var(--duration_2);
		--progress_bar_height: var(--spacing_xs2);
		--progress_bar_bg: var(--lighten_3);
	}
</style>
