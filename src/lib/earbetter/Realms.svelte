<script lang="ts">
	import {slide} from 'svelte/transition';

	import {Realm_Data} from '$lib/earbetter/realm.js';
	import Realm_Items from '$lib/earbetter/Realm_Items.svelte';
	import type {App} from '$lib/earbetter/app.svelte.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {select_realm, edit_realm, remove_realm} = $derived(app);

	const creating = $derived(
		app.editing_realm &&
			!!app.editing_realm_data &&
			app.selected_realm_data?.id !== app.editing_realm_data.id,
	);

	const no_realms = $derived(!app.realms?.length);

	const click_create_new = () => {
		if (no_realms) {
			// TODO eslint bug
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(document.querySelector('.realm_def_form input') as HTMLInputElement | null)?.focus(); // TODO hacky using the selector
		} else if (creating) {
			app.editing_realm = false;
		} else {
			edit_realm(Realm_Data.parse({}));
		}
	};
</script>

<div class="panel p_md">
	<header>
		<h2 class="my_0">realms</h2>
	</header>
	{#if app.realms && app.selected_project_data}
		<div class="pb_md" transition:slide>
			<Realm_Items
				project_data={app.selected_project_data}
				selected_realm_data={app.selected_realm_data}
				realms={app.realms}
				editing_realm_id={app.editing_realm ? app.editing_realm_id : null}
				{select_realm}
				edit_realm={(p) => edit_realm(p === app.editing_realm_data && app.editing_realm ? null : p)}
				{remove_realm}
			/>
		</div>
	{/if}
	<button
		type="button"
		class={no_realms ? undefined : 'deselectable'}
		class:selected={creating || no_realms}
		onclick={click_create_new}
	>
		create a new realm
	</button>
</div>

<style>
	button {
		width: 100%;
	}
</style>
