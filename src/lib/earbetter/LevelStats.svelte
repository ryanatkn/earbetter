<script lang="ts">
	import type {LevelDef} from '$lib/earbetter/level';
	import {MISTAKE_HISTORY_LENGTH, type LevelStats} from '$lib/earbetter/level_stats';
	import {plural} from '@feltjs/util';

	export let level_def: LevelDef;
	export let level_stats: LevelStats;

	$: ({stats} = level_stats);

	$: mistakes = $stats.mistakes[level_def.id] || [];
	$: ({length} = mistakes);
	$: full_history = length >= MISTAKE_HISTORY_LENGTH;
	$: sum = full_history ? mistakes.reduce((s, v) => s + v, 0) : undefined;
	$: perfect = sum === 0;
</script>

<div
	class="level-stats"
	title={perfect
		? `you performed flawlessly in your best ${MISTAKE_HISTORY_LENGTH} runs!`
		: full_history
		? `you made a total of ${sum} mistake${plural(sum)} in your best ${MISTAKE_HISTORY_LENGTH} runs`
		: `you've completed ${length || 'no'} run${plural(length)} of this level, do ${
				MISTAKE_HISTORY_LENGTH - length
		  }${length ? ' more' : ''} to get scored`}
>
	{#if full_history}
		{#if perfect}
			★
		{:else}
			{sum}
		{/if}
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
