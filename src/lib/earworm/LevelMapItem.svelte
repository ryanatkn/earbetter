<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {LevelDef} from '$lib/earworm/level';

	export let level_def: LevelDef;
	export let select: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let completed: boolean;

	let removing = false;
</script>

<li class="level-map-item" out:slide>
	{#if select}
		<button class="level-button" on:click={() => select?.(level_def)} class:selected={completed}>
			{level_def.id}
		</button>
	{/if}
	{#if edit}
		<button
			class="icon-button plain-button"
			on:click={() => (removing ? remove?.(level_def) : edit?.(level_def))}
		>
			{#if removing}⨂{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button class="icon-button plain-button" on:click={() => (removing = !removing)}> ✕ </button>
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
	.icon-button {
		font-size: var(--font_size_xl);
	}
</style>
