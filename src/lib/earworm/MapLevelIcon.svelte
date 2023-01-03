<script lang="ts">
	import type {LevelDef} from '$lib/tuneup/level';

	export let levelDef: LevelDef;
	export let select: (levelDef: LevelDef) => void;
	export let completed: boolean;
</script>

<button on:click={() => select(levelDef)} class:selected={completed}>{levelDef.id}</button>
