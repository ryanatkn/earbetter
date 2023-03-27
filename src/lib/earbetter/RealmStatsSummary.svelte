<script lang="ts">
	import type {RealmDef} from '$lib/earbetter/realm';
	import {MISTAKE_HISTORY_LENGTH, type LevelStats} from '$lib/earbetter/level';

	export let realm_def: RealmDef;
	export let level_stats: LevelStats;

	$: mistakes = realm_def.level_defs.map((l) => level_stats.mistakes[l.id] || []);
	$: length = mistakes.reduce((sum, v) => sum + v.length, 0);
	$: target = MISTAKE_HISTORY_LENGTH * mistakes.length;
	$: full_history = length >= target;
	$: sum = full_history
		? mistakes.reduce((sum, v) => sum + v.reduce((sum2, v2) => sum2 + v2, 0), 0)
		: undefined;
	$: perfect = sum === 0;
</script>

{#if perfect}
	<div class="level-stats-summary" title="you performed flawlessly in every level of this realm!">
		★
	</div>
{/if}

<style>
	.level-stats-summary {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--input_height);
	}
</style>
