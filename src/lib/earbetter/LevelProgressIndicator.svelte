<script lang="ts">
	import type {Level, Status, Trial} from '$lib/earbetter/level';

	export let level: Level;

	$: ({def, trial, status, trials} = level);

	// TODO colors
	const get_bg_color = (s: Status, t: Trial | null, ts: Trial[], index: number) => {
		return s === 'complete'
			? 'rgba(255, 255, 255, 0.6)'
			: ts[index] // trials are created when needed, not ahead of time
			? t && index === t.index
				? 'rgba(255, 255, 255, 0.4)'
				: 'rgba(255, 255, 255, 0.2)'
			: 'transparent';
	};

	$: percent_complete =
		$status === 'complete' ? 1 : $trial ? ($trial.index + 0.5) / $def.trial_count : 0;
</script>

<div class="level-progress-indicator" style:--percent_complete={percent_complete}>
	{#each {length: $def.trial_count} as _, index}
		<div class="level" style="background-color: {get_bg_color($status, $trial, $trials, index)}" />
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
	.progress-bar {
		position: absolute;
		left: 0;
		top: calc(50% - var(--spacing_md) / 2);
		width: calc(var(--percent_complete) * 100%);
		height: var(--spacing_md);
		background-color: var(--tint_light_4);
		border-radius: var(--border_radius);
		transition: width var(--duration_4) ease;
	}
</style>
