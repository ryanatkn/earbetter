<script lang="ts">
	import type {LevelDef} from '$lib/earworm/level';

	export let level_def: LevelDef;
	export let select: (level_def: LevelDef) => void;
	export let remove: ((level_def: LevelDef) => void) | null = null;
	export let completed: boolean;
</script>

<li>
	<button class="level-button" on:click={() => select(level_def)} class:selected={completed}
		>{level_def.id}</button
	>
	{#if remove}
		<button class="icon-button plain-button" on:click={() => remove?.(level_def)}>✕</button>
	{/if}
</li>

<style>
	.level-button {
		flex: 1;
	}
</style>
