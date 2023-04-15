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
</script>

<div class="level-progress-indicator">
	{#each {length: $def.trial_count} as _, index}
		<div class="level" style="background-color: {get_bg_color($status, $trial, $trials, index)}" />
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
		background-color: transparent;
		transition: background-color linear var(--duration_1);
	}
</style>
