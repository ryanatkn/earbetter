<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { slide } from 'svelte/transition';
	import { swallow } from '@fuzdev/fuz_util/dom.ts';

	import { create_project_id, ProjectData, ProjectName, type ProjectId } from './project.ts';
	import ImportDataDialog from './ImportDataDialog.svelte';

	interface Props {
		project_data: ProjectData;
		editing?: boolean;
		onsubmit: (project_data: ProjectData) => void;
		onremove?: (project_id: ProjectId) => void;
		onduplicate?: (project_id: ProjectId) => void;
		onclose?: (project_id: ProjectId) => void;
	}

	const {
		project_data,
		editing = false,
		onsubmit,
		onremove,
		onduplicate,
		onclose
	}: Props = $props();

	let removing = $state(false);

	let updated_name: ProjectName = $derived(project_data.name); // TODO name? `changed`?
	const normalized_updated_name = $derived(updated_name.trim());

	const to_data = (): ProjectData =>
		s.parse_or_throw(ProjectData, {
			id: project_data.id,
			name: normalized_updated_name,
			realms: project_data.realms,
			level_stats: project_data.level_stats
		});

	const changed = $derived(normalized_updated_name !== project_data.name);
</script>

<form>
	<header>
		<h2 class="my_0">
			{#if editing}editing project{:else}create a new project{/if}
		</h2>
	</header>
	<fieldset>
		<label>
			<div class="title">name</div>
			<input
				bind:value={updated_name}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						swallow(e);
						onsubmit(to_data());
					}
				}}
			/>
		</label>
	</fieldset>
	<button
		type="button"
		class="accent width:100%"
		onclick={() => onsubmit(to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to project{:else}create project{/if}
	</button>
	{#if onremove && editing}
		<button class="width:100%" type="button" onclick={() => (removing = !removing)}>
			remove project
		</button>
		{#if removing}
			<div transition:slide class="pb_md">
				<button
					type="button"
					class="palette_c width:100%"
					onclick={() => {
						removing = false;
						onremove(project_data.id);
					}}
				>
					✕ confirm remove
				</button>
			</div>
		{/if}
		{#if onduplicate}
			<button type="button" class="width:100%" onclick={() => onduplicate(project_data.id)}>
				duplicate project
			</button>
		{/if}
	{/if}
	<ImportDataDialog
		noun="project"
		data={project_data}
		{to_data}
		parse={(json) => s.parse_or_throw(ProjectData, json)}
		create_id={create_project_id}
		onimport={onsubmit}
	>
		{#snippet children(open)}
			<button type="button" class="width:100%" onclick={open}>
				{#if editing}import/export data{:else}import data{/if}
			</button>
		{/snippet}
	</ImportDataDialog>
	{#if onclose && editing}
		<button type="button" class="width:100%" onclick={() => onclose(project_data.id)}>
			{#if changed}discard changes and stop editing{:else}close project editor{/if}
		</button>
	{/if}
</form>

<style>
	button:not(:last-child) {
		margin-bottom: var(--space_md);
	}
</style>
