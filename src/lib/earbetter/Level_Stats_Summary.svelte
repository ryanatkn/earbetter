<script lang="ts">
	import {plural} from '@ryanatkn/belt/string.js';

	import {MISTAKE_HISTORY_LENGTH, type Level_Data, type Level_Stats} from '$lib/earbetter/level.js';

	interface Props {
		level_data: Level_Data;
		level_stats: Level_Stats;
	}

	const {level_data, level_stats}: Props = $props();

	const mistakes = $derived(level_stats.mistakes[level_data.id] ?? []);
	const {length} = $derived(mistakes);
	const remainder = $derived(Math.max(0, MISTAKE_HISTORY_LENGTH - length));
	const full_history = $derived(length >= MISTAKE_HISTORY_LENGTH);
	const sum = $derived(full_history ? mistakes.reduce((s, v) => s + v, 0) : undefined);
	const perfect = $derived(sum === 0);
</script>

<div
	class="level_stats_summary"
	title={perfect
		? `you performed flawlessly in your best ${MISTAKE_HISTORY_LENGTH} runs!`
		: full_history
			? `you made a total of ${sum} mistake${plural(
					sum,
				)} in your best ${MISTAKE_HISTORY_LENGTH} runs`
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
	.level_stats_summary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--input_height);
		font-weight: 600;
	}
	.remainder {
		opacity: var(--fade_3);
	}
</style>
