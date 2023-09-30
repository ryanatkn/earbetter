<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';
	import {swallow} from '@grogarden/util/dom.js';
	import Dialog from '@fuz.dev/fuz_dialog/Dialog.svelte';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';

	import {create_project_id, ProjectData, type ProjectId} from '$lib/earbetter/project';

	const dispatch = createEventDispatcher<{
		submit: ProjectData;
		remove: ProjectId;
		duplicate: ProjectId;
	}>();

	const DEFAULT_NAME = 'new project';

	export let project_data: ProjectData | null = null;
	export let id = create_project_id();
	export let name = DEFAULT_NAME;
	export let editing = false;

	let removing = false;

	const to_data = (): ProjectData =>
		ProjectData.parse({
			...project_data,
			id,
			name,
		});

	$: set_project_data(project_data);
	const set_project_data = (project_data: ProjectData | null): void => {
		console.log(`set_project_data`, project_data);
		if (project_data) {
			id = project_data.id;
			name = project_data.name;
		} else {
			id = create_project_id(); // TODO duplicates work on first mount with no project_data, but not sure it's worth fixing, maybe there's a better pattern without this?
			name = DEFAULT_NAME;
		}
	};

	$: changed = !project_data || id !== project_data.id || name !== project_data.name;

	// TODO lots of similarity with `LevelForm`
	let importing = false;
	let serialized = '';
	let updated = '';
	$: changed_serialized = serialized !== updated;
	let parse_error_message = '';
	$: project_data, id, (parse_error_message = '');
	let project_data_el: HTMLTextAreaElement;
	let start_importing_el: HTMLButtonElement;

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_project_id();
			const parsed = ProjectData.parse(json);
			dispatch('submit', parsed);
		} catch (err) {
			console.error('failed to import data', err);
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
		on:close={() => {
			importing = false;
			start_importing_el.focus();
		}}
	>
		<div class="importing prose padded-xl column centered">
			<h2>import project data</h2>
			<button
				on:click={() => {
					void navigator.clipboard.writeText(updated);
					project_data_el.select();
				}}
			>
				copy to clipboard
			</button>
			<textarea bind:value={updated} bind:this={project_data_el} />
			<button
				on:click={import_data}
				disabled={!changed_serialized}
				title={changed_serialized ? undefined : 'data has not changed'}
			>
				import project data
			</button>
		</div>
	</Dialog>
{/if}
<form class="project-def-form">
	<header>
		<h2>
			{#if editing}editing project{:else}create a new project{/if}
		</h2>
	</header>
	<fieldset>
		<label>
			<div class="title">name</div>
			<input
				bind:value={name}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						swallow(e);
						dispatch('submit', to_data());
					}
				}}
			/>
		</label>
	</fieldset>
	<button
		class="accent"
		type="button"
		on:click={() => dispatch('submit', to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to project{:else}create project{/if}
	</button>
	{#if editing}
		<button type="button" style:margin-bottom={0} on:click={() => (removing = !removing)}>
			remove project
		</button>
		{#if removing}
			<div transition:slide|local>
				<button
					class="w-full"
					type="button"
					style:margin-bottom={0}
					on:click={() => {
						removing = false;
						dispatch('remove', id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
		<button
			type="button"
			style:margin-top="var(--spacing_lg)"
			on:click={() => dispatch('duplicate', id)}
		>
			duplicate
		</button>
	{/if}
	<button type="button" on:click={start_importing_data} bind:this={start_importing_el}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if parse_error_message}
		<div class="message-wrapper">
			<Alert status="error"><pre>{parse_error_message}</pre></Alert>
		</div>
	{/if}
	<slot name="footer" {changed} />
</form>

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
	.message-wrapper {
		overflow-x: auto;
	}
</style>
