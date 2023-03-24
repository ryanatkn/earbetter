<script lang="ts">
	import type {LevelDef} from '$lib/earbetter/level';
	import type {LevelStats} from '$lib/earbetter/level_stats';

	export let level_def: LevelDef;
	export let level_stats: LevelStats;

	$: ({stats} = level_stats);

	$: mistakes = $stats.mistakes[level_def.id] || [];
</script>

<div class="level-stats">
	{mistakes.join(', ')}
</div>

<style>
	.level-stats {
		display: block;
		width: var(--input_height);
		height: var(--input_width);
	}
</style>
