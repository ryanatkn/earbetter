<script lang="ts">
	import {slide} from 'svelte/transition';
	import {swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import type {Snippet} from 'svelte';

	import {create_project_id, Project_Data, type Project_Id} from '$lib/earbetter/project.js';

	interface Props {
		project_data?: Project_Data | null;
		id?: Project_Id;
		name?: string;
		editing?: boolean;
		onsubmit?: (project_data: Project_Data) => void;
		onremove?: (project_id: Project_Id) => void;
		onduplicate?: (project_id: Project_Id) => void;
		footer?: Snippet<[changed: boolean]>;
	}

	const DEFAULT_NAME = 'new project';

	let {
		project_data = null, // eslint-disable-line prefer-const
		id = $bindable(create_project_id()),
		name = $bindable(DEFAULT_NAME),
		editing = false, // eslint-disable-line prefer-const
		onsubmit, // eslint-disable-line prefer-const
		onremove, // eslint-disable-line prefer-const
		onduplicate, // eslint-disable-line prefer-const
		footer, // eslint-disable-line prefer-const
	}: Props = $props();

	let removing = $state(false);

	const to_data = (): Project_Data =>
		Project_Data.parse({
			...project_data,
			id,
			name,
		});

	// TODO BLOCK @multiple misusing effect setting state
	$effect(() => set_project_data(project_data));
	const set_project_data = (project_data: Project_Data | null): void => {
		console.log(`set_project_data`, project_data);
		if (project_data) {
			id = project_data.id;
			name = project_data.name;
		} else {
			id = create_project_id(); // TODO duplicates work on first mount with no project_data, but not sure it's worth fixing, maybe there's a better pattern without this?
			name = DEFAULT_NAME;
		}
	};

	const changed = $derived(!project_data || id !== project_data.id || name !== project_data.name);

	// TODO lots of similarity with `Level_Form`
	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	let parse_error_message = $state('');
	// TODO BLOCK @multiple misusing effect setting state
	$effect(() => {
		project_data;
		id;
		parse_error_message = '';
	});
	let project_data_el: HTMLTextAreaElement | undefined = $state();
	let start_importing_el: HTMLButtonElement | undefined = $state();

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_project_id();
			const parsed = Project_Data.parse(json);
			onsubmit?.(parsed);
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
		onclose={() => {
			importing = false;
			start_importing_el?.focus();
		}}
	>
		<div class="importing p_xl width_md box">
			<h2 class="my_0">import project data</h2>
			<button
				onclick={() => {
					void navigator.clipboard.writeText(updated);
					project_data_el?.select();
				}}
			>
				copy to clipboard
			</button>
			<textarea bind:value={updated} bind:this={project_data_el}></textarea>
			<button
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
				bind:value={name}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						swallow(e);
						onsubmit?.(to_data());
					}
				}}
			/>
		</label>
	</fieldset>
	<button
		class="accent"
		type="button"
		onclick={() => onsubmit?.(to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to project{:else}create project{/if}
	</button>
	{#if editing}
		<button type="button" style:margin-bottom={0} onclick={() => (removing = !removing)}>
			remove project
		</button>
		{#if removing}
			<div transition:slide|local>
				<button
					class="w_100"
					type="button"
					style:margin-bottom={0}
					onclick={() => {
						removing = false;
						onremove?.(id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
		<button type="button" style:margin-top="var(--space_lg)" onclick={() => onduplicate?.(id)}>
			duplicate
		</button>
	{/if}
	<button type="button" onclick={start_importing_data} bind:this={start_importing_el}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if parse_error_message}
		<div class="overflow_x_auto">
			<Alert status="error"><pre>{parse_error_message}</pre></Alert>
		</div>
	{/if}
	{#if footer}
		{@render footer(changed)}
	{/if}
</form>

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
</style>
