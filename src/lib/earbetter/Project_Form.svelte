<script lang="ts">
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
	import Copy_To_Clipboard from '$lib/earbetter/Copy_To_Clipboard.svelte';

	interface Props {
		project_data: Project_Data;
		editing?: boolean;
		onsubmit: (project_data: Project_Data) => void;
		onremove?: (project_id: Project_Id) => void;
		onduplicate?: (project_id: Project_Id) => void;
		onclose?: (project_id: Project_Id) => void;
	}

	const {project_data, editing = false, onsubmit, onremove, onduplicate, onclose}: Props = $props();

	let removing = $state(false);

	let updated_name: Project_Name = $state(project_data.name); // TODO name? `changed`?
	const normalized_updated_name = $derived(updated_name.trim());

	const to_data = (): Project_Data =>
		Project_Data.parse({
			id: project_data.id,
			name: normalized_updated_name,
			realms: project_data.realms,
			level_stats: project_data.level_stats,
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

	const import_data = (): void => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_project_id();
			const parsed = Project_Data.parse(json);
			onsubmit(parsed);
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
			<Copy_To_Clipboard
				text={updated}
				oncopy={() => {
					project_data_el?.select();
				}}
			/>
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
						onsubmit(to_data());
					}
				}}
			/>
		</label>
	</fieldset>
	<button
		type="button"
		class="accent w_100"
		onclick={() => onsubmit(to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to project{:else}create project{/if}
	</button>
	{#if onremove && editing}
		<button class="w_100" type="button" onclick={() => (removing = !removing)}>
			remove project
		</button>
		{#if removing}
			<div transition:slide>
				<button
					type="button"
					class="w_100"
					onclick={() => {
						removing = false;
						onremove(project_data.id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
		{#if onduplicate}
			<button type="button" class="w_100" onclick={() => onduplicate(project_data.id)}>
				duplicate project
			</button>
		{/if}
	{/if}
	<button type="button" class="w_100" onclick={start_importing_data} bind:this={start_importing_el}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if parse_error_message}
		<div class="overflow_x_auto">
			<Alert status="error"><pre>{parse_error_message}</pre></Alert>
		</div>
	{/if}
	{#if onclose && editing}
		<button type="button" class="w_100" onclick={() => onclose(project_data.id)}>
			{#if changed}discard changes and stop editing{:else}close project editor{/if}
		</button>
	{/if}
</form>

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
</style>
