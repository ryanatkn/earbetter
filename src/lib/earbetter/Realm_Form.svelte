<script lang="ts">
	import {slide} from 'svelte/transition';
	import {swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {create_realm_id, Realm_Data, Realm_Name, type Realm_Id} from '$lib/earbetter/realm.js';
	import default_project_data from '$lib/projects/default_project.js';

	interface Props {
		realm_data: Realm_Data;
		editing?: boolean;
		onsubmit: (realm_data: Realm_Data) => void;
		onremove?: (realm_id: Realm_Id) => void;
		onduplicate?: (realm_id: Realm_Id) => void;
		onclose?: () => void;
	}

	const {realm_data, editing = false, onsubmit, onremove, onduplicate, onclose}: Props = $props();

	let removing = $state(false);

	let updated_name: Realm_Name = $state(realm_data.name); // TODO name? `changed`?
	const normalized_updated_name = $derived((updated_name as any)?.trim());

	const to_data = (): Realm_Data =>
		Realm_Data.parse({
			...realm_data,
			name: normalized_updated_name,
		});

	// TODO review this effect to try to remove it
	$effect(() => {
		console.log(`set_realm_data`, realm_data);
		updated_name = realm_data.name;
	});

	const changed = $derived(normalized_updated_name !== realm_data.name);

	// TODO lots of similarity with `Level_Form`
	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	let parse_error_message = $state('');
	// TODO review this effect to try to remove it
	$effect(() => {
		realm_data;
		parse_error_message = '';
	});
	let realm_data_el: HTMLTextAreaElement | undefined = $state();
	let start_importing_el: HTMLButtonElement | undefined = $state();

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_realm_id();
			const parsed = Realm_Data.parse(json);
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

	const default_realms = default_project_data().realms;

	let toggle_create_default_realms = $state(false);
</script>

{#if importing}
	<Dialog
		onclose={() => {
			importing = false;
			start_importing_el?.focus();
		}}
	>
		<div class="importing bg shadow_d_xl p_xl width_md box">
			<h2 class="my_0">import realm data</h2>
			<button
				type="button"
				onclick={() => {
					void navigator.clipboard.writeText(updated);
					realm_data_el?.select();
				}}
			>
				copy to clipboard
			</button>
			<textarea bind:value={updated} bind:this={realm_data_el}></textarea>
			<button
				type="button"
				onclick={import_data}
				disabled={!changed_serialized}
				title={changed_serialized ? undefined : 'data has not changed'}
			>
				import realm data
			</button>
		</div>
	</Dialog>
{/if}
<!-- TODO this class `.realm_def_form` is used to focus from another component -->
<form class="realm_def_form">
	<header>
		<h2 class="my_0">
			{#if editing}editing realm{:else}create a new realm{/if}
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
		class="accent"
		onclick={() => onsubmit(to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to realm{:else}create realm{/if}
	</button>
	{#if onremove && editing}
		<button type="button" onclick={() => (removing = !removing)}> remove realm </button>
		{#if removing}
			<div transition:slide|local>
				<button
					type="button"
					class="w_100"
					onclick={() => {
						removing = false;
						onremove(realm_data.id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
		{#if onduplicate}
			<button
				type="button"
				style:margin-top="var(--space_lg)"
				onclick={() => onduplicate(realm_data.id)}
			>
				duplicate realm
			</button>
		{/if}
	{/if}
	<button type="button" onclick={start_importing_data} bind:this={start_importing_el}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if !editing}
		<button
			type="button"
			onclick={() => (toggle_create_default_realms = !toggle_create_default_realms)}
		>
			create default realms
		</button>
		{#if toggle_create_default_realms}
			<div transition:slide|local>
				<button
					type="button"
					class="w_100"
					onclick={() => {
						toggle_create_default_realms = false;
						for (const realm_data of default_project_data().realms) {
							onsubmit(realm_data);
						}
					}}
				>
					create {default_realms.length} new realms
				</button>
			</div>
		{/if}
	{/if}
	{#if parse_error_message}
		<div class="message-wrapper">
			<Alert status="error"><pre>{parse_error_message}</pre></Alert>
		</div>
	{/if}
	{#if onclose && editing}
		<button class="w_100" type="button" onclick={onclose}>
			{#if changed}discard changes{:else}close realm editor{/if}
		</button>
	{/if}
</form>

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
	.message-wrapper {
		overflow-x: auto;
	}

	button {
		width: 100%;
	}
</style>
