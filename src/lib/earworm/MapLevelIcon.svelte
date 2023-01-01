<script lang="ts">
	import type {LevelDef} from '$lib/earworm/level';

	export let levelDef: LevelDef;
	export let select: (levelDef: LevelDef) => void;
	export let completed: boolean;
</script>

<button
	on:click={() => select(levelDef)}
	class={completed ? 'border-accent' : 'border-primary'}
	style="left: {levelDef.x}px; top: {levelDef.y}px;"
>
	<div class="color-primary">{levelDef.id}</div>
</button>

<style>
	button {
		position: absolute;
	}
</style>
