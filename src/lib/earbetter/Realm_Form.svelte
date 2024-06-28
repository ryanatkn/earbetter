<script lang="ts">
	import type {Snippet} from 'svelte';
	import {slide} from 'svelte/transition';
	import {swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {create_realm_id, Realm_Data, type Realm_Id} from '$lib/earbetter/realm.js';
	import default_project_data from '$lib/projects/default_project.js';

	interface Props {
		realm_data?: Realm_Data | null;
		id?: Realm_Id;
		name?: string;
		editing?: boolean;
		onsubmit?: (realm_data: Realm_Data) => void;
		onremove?: (realm_id: Realm_Id) => void;
		onduplicate?: (realm_id: Realm_Id) => void;
		footer?: Snippet<[changed: boolean]>;
	}

	const DEFAULT_NAME = 'new realm';

	let {
		realm_data = null, // eslint-disable-line prefer-const
		id = $bindable(create_realm_id()),
		name = $bindable(DEFAULT_NAME),
		editing = false, // eslint-disable-line prefer-const
		onsubmit, // eslint-disable-line prefer-const
		onremove, // eslint-disable-line prefer-const
		onduplicate, // eslint-disable-line prefer-const
		footer, // eslint-disable-line prefer-const
	}: Props = $props();

	let removing = $state(false);

	const to_data = (): Realm_Data =>
		Realm_Data.parse({
			...realm_data,
			id,
			name,
		});

	// TODO BLOCK @multiple misusing effect setting state
	$effect(() => {
		set_realm_data(realm_data);
	});
	const set_realm_data = (realm_data: Realm_Data | null): void => {
		console.log(`set_realm_data`, realm_data);
		if (realm_data) {
			id = realm_data.id;
			name = realm_data.name;
		} else {
			id = create_realm_id(); // TODO duplicates work on first mount with no realm_data, but not sure it's worth fixing, maybe there's a better pattern without this?
			name = DEFAULT_NAME;
		}
	};

	const changed = $derived(!realm_data || id !== realm_data.id || name !== realm_data.name);

	// TODO lots of similarity with `Level_Form`
	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	let parse_error_message = $state('');
	// TODO BLOCK @multiple misusing effect setting state
	$effect(() => {
		realm_data;
		id;
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
		<div class="importing p_xl width_md box">
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
				onclick={import_data}
				disabled={!changed_serialized}
				type="button"
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
		{#if editing}save changes to realm{:else}create realm{/if}
	</button>
	{#if editing}
		<button type="button" style:margin-bottom={0} onclick={() => (removing = !removing)}>
			remove realm
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
	{#if !editing}
		<button
			type="button"
			onclick={() => (toggle_create_default_realms = !toggle_create_default_realms)}
			style:margin-bottom={0}
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
							onsubmit?.(realm_data);
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
	{#if footer}
		{@render footer(changed)}
	{/if}
</form>

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
	.message-wrapper {
		overflow-x: auto;
	}
</style>
