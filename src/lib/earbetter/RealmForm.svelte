<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { slide } from 'svelte/transition';
	import { swallow } from '@fuzdev/fuz_util/dom.ts';
	import Dialog from '@fuzdev/fuz_ui/Dialog.svelte';
	import Alert from '@fuzdev/fuz_ui/Alert.svelte';

	import { create_realm_id, RealmData, RealmName, type RealmId } from './realm.ts';
	import default_project_data from '../projects/default_project.ts';
	import CopyToClipboard from './CopyToClipboard.svelte';

	interface Props {
		realm_data: RealmData;
		editing?: boolean;
		onsubmit: (realm_data: RealmData | Array<RealmData>) => void;
		onremove?: (realm_id: RealmId) => void;
		onduplicate?: (realm_id: RealmId) => void;
		onclose?: (realm_id: RealmId) => void;
	}

	const { realm_data, editing = false, onsubmit, onremove, onduplicate, onclose }: Props = $props();

	let removing = $state(false);

	let updated_name: RealmName = $derived(realm_data.name); // TODO name? `changed`?
	const normalized_updated_name = $derived(updated_name.trim());

	const to_data = (): RealmData =>
		s.parse_or_throw(RealmData, {
			id: realm_data.id,
			name: normalized_updated_name,
			levels: realm_data.levels
		});

	const changed = $derived(normalized_updated_name !== realm_data.name);

	// TODO lots of similarity with `LevelForm`
	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	// resets when the `realm_data` prop changes, and import failures overwrite it
	let parse_error_message = $derived.by(() => {
		realm_data;
		return '';
	});
	let realm_data_el: HTMLTextAreaElement | undefined = $state();
	let start_importing_el: HTMLButtonElement | undefined = $state();

	const import_data = (): void => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_realm_id();
			const parsed = s.parse_or_throw(RealmData, json);
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
		<div class="importing pane shadow_xl shadow_d_50 p_xl width_atmost_md mx_auto">
			<h2 class="my_0">import realm data</h2>
			<CopyToClipboard
				text={updated}
				oncopy={() => {
					realm_data_el?.select();
				}}
			/>
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
		<button type="button" onclick={() => (removing = !removing)}>remove realm</button>
		{#if removing}
			<div transition:slide class="pb_md">
				<button
					type="button"
					class="palette_c width:100%"
					onclick={() => {
						removing = false;
						onremove(realm_data.id);
					}}
				>
					✕ confirm remove
				</button>
			</div>
		{/if}
		{#if onduplicate}
			<button type="button" onclick={() => onduplicate(realm_data.id)}>duplicate realm</button>
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
			<div transition:slide>
				<button
					type="button"
					class="width:100%"
					onclick={() => {
						toggle_create_default_realms = false;
						onsubmit(default_project_data().realms);
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
		<button class="width:100%" type="button" onclick={() => onclose(realm_data.id)}>
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
	button:not(:last-child) {
		margin-bottom: var(--space_md);
	}
</style>
