<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { slide } from 'svelte/transition';
	import { swallow } from '@fuzdev/fuz_util/dom.ts';

	import { create_realm_id, RealmData, RealmName, type RealmId } from './realm.ts';
	import default_project_data from '../projects/default_project.ts';
	import ImportDataDialog from './ImportDataDialog.svelte';
	import { app_context } from './app.svelte.ts';

	interface Props {
		realm_data: RealmData;
		editing?: boolean;
		onsubmit: (realm_data: RealmData | Array<RealmData>) => void;
		onremove?: (realm_id: RealmId) => void;
		onduplicate?: (realm_id: RealmId) => void;
		onclose?: (realm_id: RealmId) => void;
	}

	const { realm_data, editing = false, onsubmit, onremove, onduplicate, onclose }: Props = $props();

	const app = app_context.get();

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

	const default_realms = default_project_data().realms;

	let toggle_create_default_realms = $state(false);
</script>

<form {@attach app.register_form('realm')}>
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
	<ImportDataDialog
		noun="realm"
		data={realm_data}
		{to_data}
		parse={(json) => s.parse_or_throw(RealmData, json)}
		create_id={create_realm_id}
		onimport={onsubmit}
	>
		{#snippet children(open)}
			<button type="button" onclick={open}>
				{#if editing}import/export data{:else}import data{/if}
			</button>
		{/snippet}
	</ImportDataDialog>
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
	{#if onclose && editing}
		<button class="width:100%" type="button" onclick={() => onclose(realm_data.id)}>
			{#if changed}discard changes{:else}close realm editor{/if}
		</button>
	{/if}
</form>

<style>
	button {
		width: 100%;
	}
	button:not(:last-child) {
		margin-bottom: var(--space_md);
	}
</style>
