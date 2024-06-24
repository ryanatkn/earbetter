<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {Project_Data, Project_Id, Project_Metadata} from '$lib/earbetter/project.js';

	export let project: Project_Metadata;
	export let project_data: Project_Data | undefined; // may not be loaded
	export let load: (id: Project_Id) => Project_Data | null;
	export let select: ((id: Project_Id) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((project_data: Project_Data | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: Project_Id) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;
	export let editing: boolean;

	let removing = false;
</script>

<li class="project_item" transition:slide|local class:selected>
	{#if select}
		<button class="project-button" onclick={() => select?.(project.id)} class:selected>
			{project.name}
		</button>
	{/if}
	{#if (removing && remove) || (!removing && edit)}
		<button
			class="icon_button plain_button deselectable"
			title={removing ? 'remove project' : 'edit project'}
			class:selected={selected && !removing && editing}
			onclick={() => (removing ? remove?.(project.id) : edit?.(project_data || load(project.id)))}
		>
			{#if removing}✖{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			class="icon_button plain_button"
			onclick={() => (removing = !removing)}
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
	.plain_button:not(.selected) {
		visibility: hidden;
	}
	.project_item:hover .plain_button,
	li.selected .plain_button {
		visibility: visible;
	}
	.project-button {
		flex: 1;
	}
	.icon_button {
		font-size: var(--size_xl);
	}
</style>
