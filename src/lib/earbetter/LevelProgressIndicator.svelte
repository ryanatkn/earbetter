<script lang="ts">
	import type {Level, Status, Trial} from '$lib/earbetter/level';

	export let level: Level;

	$: ({def, trial, status, trials} = level);

	const to_bg_color = (s: Status, t: Trial | null, ts: Trial[], index: number) => {
		return s === 'complete'
			? 'var(--tint_light_5)'
			: ts[index] // trials are created when needed, not ahead of time
			? t && index === t.index
				? 'var(--tint_light_4)'
				: 'var(--tint_light_2)'
			: 'transparent';
	};

	$: percent_complete =
		$status === 'complete' ? 1 : $trial ? ($trial.index + 0.5) / $def.trial_count : 0;
</script>

<div class="level-progress-indicator" style:--progress_bar_percent={percent_complete}>
	{#each {length: $def.trial_count} as _, index}
		<div class="level" style="background-color: {to_bg_color($status, $trial, $trials, index)}" />
	{/each}
	<div class="progress-bar" />
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
		background-color: transparent;
		transition: background-color linear var(--duration_5);
	}
</style>
