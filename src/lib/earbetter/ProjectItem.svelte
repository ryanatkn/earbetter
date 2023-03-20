<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';

	export let level_def: ProjectDef;
	export let select: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((level_def: ProjectDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;
	export let completed: boolean;

	let removing = false;
</script>

<li class="project-item" transition:slide|local>
	{#if select}
		<button
			class="level-button"
			on:click={() => select?.(level_def.id)}
			class:selected
			class:completed
		>
			{level_def.name}
		</button>
	{/if}
	{#if edit}
		<button
			class="icon-button plain-button"
			on:click={() => (removing ? remove?.(level_def.id) : edit?.(level_def))}
		>
			{#if removing}✖{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button class="icon-button plain-button" on:click={() => (removing = !removing)}>
			{#if removing}×{:else}✕{/if}
		</button>
	{/if}
</li>

<style>
	.plain-button {
		visibility: hidden;
	}
	.project-item:hover .plain-button {
		visibility: visible;
	}
	.level-button {
		flex: 1;
	}
	.icon-button {
		font-size: var(--font_size_xl);
	}
</style>
