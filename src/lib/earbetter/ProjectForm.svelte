<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { slide } from 'svelte/transition';
	import { swallow } from '@fuzdev/fuz_util/dom.ts';
	import Dialog from '@fuzdev/fuz_ui/Dialog.svelte';
	import Alert from '@fuzdev/fuz_ui/Alert.svelte';

	import { create_project_id, ProjectData, ProjectName, type ProjectId } from './project.ts';
	import CopyToClipboard from './CopyToClipboard.svelte';

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

	// TODO lots of similarity with `LevelForm`
	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	// resets when the `project_data` prop changes, and import failures overwrite it
	let parse_error_message = $derived.by(() => {
		project_data;
		return '';
	});
	let project_data_el: HTMLTextAreaElement | undefined = $state();
	let start_importing_el: HTMLButtonElement | undefined = $state();

	const import_data = (): void => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_project_id();
			const parsed = s.parse_or_throw(ProjectData, json);
			onsubmit(parsed);
		} catch (err) {
			parse_error_message = err.message || 'unknown error';
		}
		importing = false;
	};

	const start_importing_data = () => {
		serialized = updated = JSON.stringify(to_data());
		importing = true;
	};
</script>

{#if importing}
	<Dialog
		onclose={() => {
			importing = false;
			start_importing_el?.focus();
		}}
	>
		<div class="importing pane shadow_xl shadow_d_50 p_xl width_atmost_md mx_auto">
			<h2 class="my_0">import project data</h2>
			<CopyToClipboard
				text={updated}
				oncopy={() => {
					project_data_el?.select();
				}}
			/>
			<textarea bind:value={updated} bind:this={project_data_el}></textarea>
			<button
				type="button"
				onclick={import_data}
				disabled={!changed_serialized}
				title={changed_serialized ? undefined : 'data has not changed'}
			>
				import project data
			</button>
		</div>
	</Dialog>
{/if}
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
	<button
		type="button"
		class="width:100%"
		onclick={start_importing_data}
		bind:this={start_importing_el}
	>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if parse_error_message}
		<div class="overflow-x:auto">
			<Alert status="error"><pre>{parse_error_message}</pre></Alert>
		</div>
	{/if}
	{#if onclose && editing}
		<button type="button" class="width:100%" onclick={() => onclose(project_data.id)}>
			{#if changed}discard changes and stop editing{:else}close project editor{/if}
		</button>
	{/if}
</form>

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}

	button:not(:last-child) {
		margin-bottom: var(--space_md);
	}
</style>
