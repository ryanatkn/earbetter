<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';
	import {swallow} from '@ryanatkn/belt/dom.js';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {create_realm_id, RealmData, type RealmId} from '$lib/earbetter/realm';
	import default_project_data from '$lib/projects/default_project';

	const dispatch = createEventDispatcher<{
		submit: RealmData;
		remove: RealmId;
		duplicate: RealmId;
	}>();

	const DEFAULT_NAME = 'new realm';

	export let realm_data: RealmData | null = null;
	export let id = create_realm_id();
	export let name = DEFAULT_NAME;
	export let editing = false;

	let removing = false;

	const to_data = (): RealmData =>
		RealmData.parse({
			...realm_data,
			id,
			name,
		});

	$: set_realm_data(realm_data);
	const set_realm_data = (realm_data: RealmData | null): void => {
		console.log(`set_realm_data`, realm_data);
		if (realm_data) {
			id = realm_data.id;
			name = realm_data.name;
		} else {
			id = create_realm_id(); // TODO duplicates work on first mount with no realm_data, but not sure it's worth fixing, maybe there's a better pattern without this?
			name = DEFAULT_NAME;
		}
	};

	$: changed = !realm_data || id !== realm_data.id || name !== realm_data.name;

	// TODO lots of similarity with `LevelForm`
	let importing = false;
	let serialized = '';
	let updated = '';
	$: changed_serialized = serialized !== updated;
	let parse_error_message = '';
	$: realm_data, id, (parse_error_message = '');
	let realm_data_el: HTMLTextAreaElement;
	let start_importing_el: HTMLButtonElement;

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_realm_id();
			const parsed = RealmData.parse(json);
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

	const default_realms = default_project_data().realms;

	let toggle_create_default_realms = false;
</script>

{#if importing}
	<Dialog
		on:close={() => {
			importing = false;
			start_importing_el.focus();
		}}
	>
		<div class="importing prose p_xl width_md box">
			<h2>import realm data</h2>
			<button
				type="button"
				on:click={() => {
					void navigator.clipboard.writeText(updated);
					realm_data_el.select();
				}}
			>
				copy to clipboard
			</button>
			<textarea bind:value={updated} bind:this={realm_data_el} />
			<button
				on:click={import_data}
				disabled={!changed_serialized}
				type="button"
				title={changed_serialized ? undefined : 'data has not changed'}
			>
				import realm data
			</button>
		</div>
	</Dialog>
{/if}
<form class="realm-def-form">
	<header>
		<h2>
			{#if editing}editing realm{:else}create a new realm{/if}
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
		{#if editing}save changes to realm{:else}create realm{/if}
	</button>
	{#if editing}
		<button type="button" style:margin-bottom={0} on:click={() => (removing = !removing)}>
			remove realm
		</button>
		{#if removing}
			<div transition:slide|local>
				<button
					class="w_100"
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
			style:margin-top="var(--space_lg)"
			on:click={() => dispatch('duplicate', id)}
		>
			duplicate
		</button>
	{/if}
	<button type="button" on:click={start_importing_data} bind:this={start_importing_el}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if !editing}
		<button
			type="button"
			on:click={() => (toggle_create_default_realms = !toggle_create_default_realms)}
			style:margin-bottom={0}
		>
			create default realms
		</button>
		{#if toggle_create_default_realms}
			<div transition:slide|local>
				<button
					type="button"
					class="w_100"
					on:click={() => {
						toggle_create_default_realms = false;
						for (const realm_data of default_project_data().realms) {
							dispatch('submit', realm_data);
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
