<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {Project_Data, Project_Id, Project_Metadata} from '$lib/earbetter/project.js';

	interface Props {
		project: Project_Metadata;
		/**
		 * May not be loaded.
		 */
		project_data: Project_Data | undefined;
		load: (id: Project_Id) => Project_Data | null;
		select?: ((id: Project_Id) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		edit?: ((project_data: Project_Data | null) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		remove?: ((id: Project_Id) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		selected: boolean;
		editing: boolean;
	}

	const {
		project,
		project_data,
		load,
		select = null,
		edit = null,
		remove = null,
		selected,
		editing,
	}: Props = $props();

	let removing = $state(false);
</script>

<li class="project_item" transition:slide|local class:selected>
	{#if select}
		<button class="flex_1" onclick={() => select?.(project.id)} class:selected>
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
	.icon_button {
		font-size: var(--size_xl);
	}
</style>
