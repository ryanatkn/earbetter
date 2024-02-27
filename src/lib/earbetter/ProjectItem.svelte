<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {ProjectData, ProjectId, ProjectMetadata} from '$lib/earbetter/project';

	export let project: ProjectMetadata;
	export let project_data: ProjectData | undefined; // may not be loaded
	export let load: (id: ProjectId) => ProjectData | null;
	export let select: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((project_data: ProjectData | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: ProjectId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;
	export let editing: boolean;

	let removing = false;
</script>

<li class="project_item" transition:slide|local class:selected>
	{#if select}
		<button class="project-button" on:click={() => select?.(project.id)} class:selected>
			{project.name}
		</button>
	{/if}
	{#if (removing && remove) || (!removing && edit)}
		<button
			class="icon-button plain-button deselectable"
			title={removing ? 'remove project' : 'edit project'}
			class:selected={selected && !removing && editing}
			on:click={() => (removing ? remove?.(project.id) : edit?.(project_data || load(project.id)))}
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
	.project_item {
		display: flex;
		width: 100%;
	}
	.plain-button:not(.selected) {
		visibility: hidden;
	}
	.project_item:hover .plain-button,
	li.selected .plain-button {
		visibility: visible;
	}
	.project-button {
		flex: 1;
	}
	.icon-button {
		font-size: var(--size_xl);
	}
</style>
