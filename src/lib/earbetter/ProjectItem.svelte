<script lang="ts">
	import { slide } from 'svelte/transition';

	import type { ProjectData, ProjectId, ProjectMetadata } from './project.ts';

	interface Props {
		project: ProjectMetadata;
		/**
		 * May not be loaded.
		 */
		project_data: ProjectData | undefined;
		load: (id: ProjectId) => ProjectData | null;
		select?: ((id: ProjectId) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		edit?: ((project_data: ProjectData | null) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		remove?: ((id: ProjectId) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
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
		editing
	}: Props = $props();

	let removing = $state(false);
</script>

<li class="project_item" transition:slide class:selected>
	{#if select}
		<button type="button" class="flex:1" onclick={() => select(project.id)} class:selected>
			{project.name}
		</button>
	{/if}
	<!-- TODO bug with eslint-plugin-svelte? -->
	<!-- eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -->
	{#if (removing && remove) || (!removing && edit)}
		<button
			type="button"
			class="icon_button plain_button font_size_xl deselectable"
			title={removing ? 'remove project' : 'edit project'}
			class:selected={selected && !removing && editing}
			class:palette_c={removing}
			onclick={() => (removing ? remove?.(project.id) : edit?.(project_data ?? load(project.id)))}
		>
			{#if removing}✕{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			type="button"
			class="icon_button plain_button font_size_xl"
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
		align-items: center;
		width: 100%;
		margin-bottom: var(--space_md);
	}
	.plain_button:not(.selected) {
		visibility: hidden;
	}
	.project_item:hover .plain_button,
	li.selected .plain_button {
		visibility: visible;
	}
</style>
