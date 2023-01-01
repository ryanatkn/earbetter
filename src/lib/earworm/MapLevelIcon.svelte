<script lang="ts">
	import type {LevelDef} from '$lib/earworm/level';

	export let levelDef: LevelDef;
	export let select: (levelDef: LevelDef) => void;
	export let isComplete: boolean;
</script>

<button
	on:click={() => select(levelDef)}
	class="absolute cursor-pointer p-8 {isComplete ? 'border-accent' : 'border-primary'}"
	style="left: {levelDef.x}px; top: {levelDef.y}px;"
>
	<div class="color-primary">{levelDef.id}</div>
</button>
