<script lang="ts">
	import type {LevelDef} from '$lib/earworm/level';

	export let level_def: LevelDef;
	export let select: (level_def: LevelDef) => void;
	export let completed: boolean;
</script>

<button on:click={() => select(level_def)} class:selected={completed}>{level_def.id}</button>
