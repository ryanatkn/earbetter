<script lang="ts">
	import type {Snippet} from 'svelte';
	import {slide} from 'svelte/transition';
	import {swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {
		create_project_id,
		Project_Data,
		Project_Name,
		type Project_Id,
	} from '$lib/earbetter/project.js';

	interface Props {
		project_data: Project_Data;
		editing?: boolean;
		onsubmit?: (project_data: Project_Data) => void;
		onremove?: (project_id: Project_Id) => void;
		onduplicate?: (project_id: Project_Id) => void;
		footer?: Snippet<[changed: boolean]>;
	}

	const {project_data, editing = false, onsubmit, onremove, onduplicate, footer}: Props = $props();

	let removing = $state(false);

	let updated_name: Project_Name = $state(project_data.name); // TODO name? `changed`?
	const normalized_updated_name = $derived(updated_name.trim());

	const to_data = (): Project_Data =>
		Project_Data.parse({
			...project_data,
			name: normalized_updated_name,
		});

	// TODO review this effect to try to remove it
	$effect(() => {
		console.log(`set_project_data`, project_data);
		updated_name = project_data.name;
	});

	const changed = $derived(normalized_updated_name !== project_data.name);

	// TODO lots of similarity with `Level_Form`
	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	let parse_error_message = $state('');
	// TODO review this effect to try to remove it
	$effect(() => {
		project_data;
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
		<div class="importing bg shadow_d_xl p_xl width_md box">
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
				bind:value={updated_name}
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
						onremove?.(project_data.id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
		<button
			type="button"
			style:margin-top="var(--space_lg)"
			onclick={() => onduplicate?.(project_data.id)}
		>
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
