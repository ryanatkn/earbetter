<script lang="ts">
	import type {Level, Status, Trial} from '$lib/earbetter/level.js';

	interface Props {
		level: Level;
	}

	const {level}: Props = $props();

	const {def, trial, status, trials} = $derived(level);

	const to_bg_color = (s: Status, t: Trial | null, ts: Trial[], index: number): string => {
		return s === 'complete'
			? 'var(--lighten_5)'
			: ts[index] // trials are created when needed, not ahead of time
				? t && index === t.index
					? 'var(--lighten_4)'
					: 'var(--lighten_2)'
				: 'transparent';
	};

	const percent_complete = $derived(
		$status === 'complete' ? 1 : $trial ? ($trial.index + 0.5) / $def.trial_count : 0,
	);
</script>

<div class="level_progress_indicator" style:--progress_bar_percent={percent_complete}>
	{#each {length: $def.trial_count} as _, index}
		<div
			class="level"
			style:background-color={to_bg_color($status, $trial, $trials, index)}
			aria-hidden="true"
		></div>
	{/each}
	<div
		class="progress_bar"
		aria-label="level progress"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.floor(percent_complete * 100)}
	></div>
</div>

<style>
	.level_progress_indicator {
		display: flex;
		width: 100%;
		height: 100%;
	}
	.level {
		flex: 1;
		border: var(--border_width) var(--border_style) var(--border_color);
		background-color: transparent;
		transition: background-color linear var(--duration_5);
	}
</style>
