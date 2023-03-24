<script lang="ts">
	import type {LevelDef} from '$lib/earbetter/level';
	import {MISTAKE_HISTORY_LENGTH, type LevelStats} from '$lib/earbetter/level_stats';

	export let level_def: LevelDef;
	export let level_stats: LevelStats;

	$: ({stats} = level_stats);

	$: mistakes = $stats.mistakes[level_def.id] || [];
	$: ({length} = mistakes);
	$: full_history = length >= MISTAKE_HISTORY_LENGTH;
	$: sum = full_history ? mistakes.reduce((s, v) => s + v, 0) : undefined;
</script>

<div
	class="level-stats"
	title={full_history
		? `you made a total of ${sum} mistakes in your best ${MISTAKE_HISTORY_LENGTH} runs`
		: undefined}
>
	<!-- TODO show a color based on the number of mistakes? -->
	{#if full_history}
		{sum}
	{:else if length}
		{'⭑'.repeat(length)}
	{/if}
</div>

<style>
	.level-stats {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--input_height);
		height: var(--input_height);
		font-weight: 600;
	}
</style>
