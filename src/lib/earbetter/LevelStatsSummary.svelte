<script lang="ts">
	import type {LevelData} from '$lib/earbetter/level';
	import {MISTAKE_HISTORY_LENGTH, type LevelStats} from '$lib/earbetter/level';
	import {plural} from '@grogarden/util';

	export let level_data: LevelData;
	export let level_stats: LevelStats;

	$: mistakes = level_stats.mistakes[level_data.id] || [];
	$: ({length} = mistakes);
	$: remainder = Math.max(0, MISTAKE_HISTORY_LENGTH - length);
	$: full_history = length >= MISTAKE_HISTORY_LENGTH;
	$: sum = full_history ? mistakes.reduce((s, v) => s + v, 0) : undefined;
	$: perfect = sum === 0;
</script>

<div
	class="level-stats-summary"
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
		<!-- TODO arrange these 5 stars in a circle -->
		{'⭑'.repeat(length)}{#if remainder}<span class="remainder">{'⭑'.repeat(remainder)}</span>{/if}
	{/if}
</div>

<style>
	.level-stats-summary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--input_height);
		font-weight: 600;
	}
	.remainder {
		opacity: var(--faded_3);
	}
</style>
