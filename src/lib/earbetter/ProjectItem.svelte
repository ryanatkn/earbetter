<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';

	export let project_def: ProjectDef;
	export let select: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((project_def: ProjectDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;
	export let completed: boolean;

	let removing = false;
</script>

<li class="project-item" transition:slide|local>
	{#if select}
		<button
			class="project-button"
			on:click={() => select?.(project_def.id)}
			class:selected
			class:completed
		>
			{project_def.name}
		</button>
	{/if}
	{#if edit}
		<button
			class="icon-button plain-button"
			on:click={() => (removing ? remove?.(project_def.id) : edit?.(project_def))}
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
	.project-button {
		flex: 1;
	}
	.icon-button {
		font-size: var(--font_size_xl);
	}
</style>
