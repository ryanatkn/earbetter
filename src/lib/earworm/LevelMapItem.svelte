<script lang="ts">
	import type {LevelDef} from '$lib/earworm/level';

	export let level_def: LevelDef;
	export let select: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let completed: boolean;
</script>

<li class="level-map-item">
	{#if select}
		<button class="level-button" on:click={() => select?.(level_def)} class:selected={completed}>
			{level_def.id}
		</button>
	{/if}
	{#if edit}
		<button class="icon-button plain-button" on:click={() => edit?.(level_def)}> ✎ </button>
	{/if}
	{#if remove}
		<button class="icon-button plain-button" on:click={() => remove?.(level_def)}> ✕ </button>
	{/if}
</li>

<style>
	.plain-button {
		visibility: hidden;
	}
	.level-map-item:hover .plain-button {
		visibility: visible;
	}
	.level-button {
		flex: 1;
	}
</style>
