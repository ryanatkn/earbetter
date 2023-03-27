<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';
	import {swallow} from '@feltjs/util/dom.js';
	import Dialog from '@feltjs/felt-ui/Dialog.svelte';
	import Message from '@feltjs/felt-ui/Message.svelte';

	import {create_realm_def, create_realm_id, RealmDef, type RealmId} from '$lib/earbetter/realm';

	const dispatch = createEventDispatcher<{submit: RealmDef; remove: RealmId}>();

	const DEFAULT_NAME = 'new realm';

	export let realm_def: RealmDef | null = null;
	export let id = create_realm_id();
	export let name = DEFAULT_NAME;
	export let editing = false;

	let removing = false;

	const to_data = (): RealmDef =>
		create_realm_def({
			...realm_def,
			id,
			name,
		});

	$: set_realm_def(realm_def);
	const set_realm_def = (realm_def: RealmDef | null): void => {
		console.log(`set_realm_def`, realm_def);
		if (realm_def) {
			id = realm_def.id;
			name = realm_def.name;
		} else {
			id = create_realm_id(); // TODO duplicates work on first mount with no realm_def, but not sure it's worth fixing, maybe there's a better pattern without this?
			name = DEFAULT_NAME;
		}
	};

	$: changed = !realm_def || id !== realm_def.id || name !== realm_def.name;

	// TODO lots of similarity with `LevelDefForm`
	let importing = false;
	let serialized = '';
	let updated = '';
	$: changed_serialized = serialized !== updated;
	let parse_error_message = '';
	$: realm_def, id, (parse_error_message = '');
	let realm_data_el: HTMLTextAreaElement;
	let start_importing_el: HTMLButtonElement;

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(serialized);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_realm_id();
			const parsed = RealmDef.parse(json);
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
		<div class="importing markup padded-xl column centered">
			<h2>import realm data</h2>
			<button
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
	<fieldset>
		<label>
			<div class="title">id</div>
			<input disabled value={id} />
		</label>
	</fieldset>
	<button
		type="button"
		on:click={() => dispatch('submit', to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to realm{:else}create realm{/if}
	</button>
	<button type="button" on:click={start_importing_data} bind:this={start_importing_el}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if parse_error_message}
		<div class="message-wrapper">
			<Message status="error"><pre>{parse_error_message}</pre></Message>
		</div>
	{/if}
	{#if editing}
		<button type="button" on:click={() => (removing = !removing)}> remove realm </button>
		{#if removing}
			<div transition:slide|local>
				<button
					class="w-full"
					type="button"
					on:click={() => {
						removing = false;
						dispatch('remove', id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
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
