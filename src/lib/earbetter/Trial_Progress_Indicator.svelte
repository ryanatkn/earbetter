<script lang="ts">
	import {fade} from 'svelte/transition';

	import type {Level, Status} from '$lib/earbetter/level.svelte.js';

	interface Props {
		level: Level;
	}

	const {level}: Props = $props();

	const current_index = $derived(
		level.trial ? (level.trial.presenting_index ?? level.trial.guessing_index) : null,
	);

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

	const percent_complete = $derived(
		level.status === 'initial' || level.status === 'showing_failure_feedback'
			? 0
			: level.status === 'complete' || level.status === 'showing_success_feedback'
				? 1
				: level.trial?.presenting_index != null
					? (level.trial.presenting_index + 0.5) / level.trial.sequence.length
					: level.trial?.guessing_index != null
						? (level.trial.guessing_index + 0.5) / level.trial.sequence.length
						: 0,
	);
</script>

{#if level.trial}
	<div
		class="trial_progress_indicator"
		style:--progress_bar_percent={percent_complete}
		transition:fade
	>
		{#each {length: level.trial.sequence.length} as _, index (index)}
			<div
				class="trial"
				style:background-color={to_bg_color(level.status, index, current_index)}
				aria-hidden="true"
			></div>
		{/each}
		<div
			class="progress_bar"
			aria-label="trial progress"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.floor(percent_complete * 100)}
		></div>
	</div>
{/if}

<style>
	.trial_progress_indicator {
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
	.progress_bar {
		--progress_bar_duration: var(--duration_2);
		--progress_bar_height: var(--space_xs2);
		--progress_bar_bg: var(--lighten_3);
	}
</style>
