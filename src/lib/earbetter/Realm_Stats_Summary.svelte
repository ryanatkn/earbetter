<script lang="ts">
	import type {Realm_Data} from '$lib/earbetter/realm.js';
	import {MISTAKE_HISTORY_LENGTH, type Level_Stats} from '$lib/earbetter/level.svelte.js';

	interface Props {
		realm_data: Realm_Data;
		level_stats: Level_Stats;
	}

	const {realm_data, level_stats}: Props = $props();

	const mistakes = $derived(realm_data.levels.map((l) => level_stats.mistakes[l.id] ?? []));
	const length = $derived(mistakes.reduce((sum, v) => sum + v.length, 0));
	const target = $derived(MISTAKE_HISTORY_LENGTH * mistakes.length);
	const full_history = $derived(!!length && length >= target);
	const sum = $derived(
		full_history
			? mistakes.reduce((sum, v) => sum + v.reduce((sum2, v2) => sum2 + v2, 0), 0)
			: undefined,
	);
	const perfect = $derived(sum === 0);
	// $inspect((`mistakes, length, target, sum, perfect`, mistakes, length, target, sum, perfect));
</script>

{#if perfect}
	<div class="realm_stats_summary" title="you performed flawlessly in every level of this realm!">
		★
	</div>
{/if}

<style>
	.realm_stats_summary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--input_height);
	}
</style>
