<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {ProjectDef, ProjectId} from '$lib/earbetter/project';

	export let project_def: ProjectDef;
	export let select: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((project_def: ProjectDef | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;

	let removing = false;
</script>

<li class="project-item" transition:slide|local>
	{#if select}
		<button class="project-button" on:click={() => select?.(project_def.id)} class:selected>
			{project_def.name}
		</button>
	{/if}
	{#if (removing && remove) || (!removing && edit)}
		<button
			class="icon-button plain-button"
			title={removing ? 'remove project' : 'edit project'}
			on:click={() => (removing ? remove?.(project_def.id) : edit?.(project_def))}
		>
			{#if removing}✖{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			class="icon-button plain-button"
			on:click={() => (removing = !removing)}
			title={removing ? 'cancel removing' : 'remove project'}
		>
			{#if removing}×{:else}✕{/if}
		</button>
	{/if}
</li>

<style>
	li {
		width: 100%;
	}
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
