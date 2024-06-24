<script lang="ts">
	import type {RealmData} from '$lib/earbetter/realm.js';
	import {MISTAKE_HISTORY_LENGTH, type LevelStats} from '$lib/earbetter/level.js';

	export let realm_data: RealmData;
	export let level_stats: LevelStats;

	$: mistakes = realm_data.levels.map((l) => level_stats.mistakes[l.id] || []);
	$: length = mistakes.reduce((sum, v) => sum + v.length, 0);
	$: target = MISTAKE_HISTORY_LENGTH * mistakes.length;
	$: full_history = !!length && length >= target;
	$: sum = full_history
		? mistakes.reduce((sum, v) => sum + v.reduce((sum2, v2) => sum2 + v2, 0), 0)
		: undefined;
	$: perfect = sum === 0;
	// $: console.log(`mistakes, length, target, sum, perfect`, mistakes, length, target, sum, perfect);
</script>

{#if perfect}
	<div class="realm-stats-summary" title="you performed flawlessly in every level of this realm!">
		★
	</div>
{/if}

<style>
	.realm-stats-summary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--input_height);
	}
</style>
