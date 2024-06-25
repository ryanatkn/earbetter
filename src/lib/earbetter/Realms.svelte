<script lang="ts">
	import {slide} from 'svelte/transition';

	import {Realm_Data} from '$lib/earbetter/realm.js';
	import Realm_Items from '$lib/earbetter/Realm_Items.svelte';
	import type {App} from '$lib/earbetter/app.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {
		selected_project_data,
		realms,
		selected_realm_data,
		editing_realm,
		editing_realm_id,
		editing_realm_data,
		select_realm,
		edit_realm,
		remove_realm,
	} = $derived(app);

	const creating = $derived(
		$editing_realm && !!$editing_realm_data && $selected_realm_data?.id !== $editing_realm_data?.id,
	);

	const no_realms = $derived(!$realms?.length);

	const click_create_new = () => {
		if (no_realms) {
			// TODO eslint bug
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(document.querySelector('.realm_def_form input') as HTMLInputElement | null)?.focus?.(); // TODO BLOCK hacky
		} else if (creating) {
			editing_realm.value = false;
		} else {
			edit_realm(Realm_Data.parse({}));
		}
	};
</script>

<div class="panel p_md">
	<header>
		<h2>realms</h2>
	</header>
	{#if $realms && $selected_project_data}
		<div class="pb_md" transition:slide|local>
			<Realm_Items
				project_data={$selected_project_data}
				selected_realm_data={$selected_realm_data}
				realms={$realms}
				editing_realm_id={$editing_realm ? $editing_realm_id : null}
				{select_realm}
				edit_realm={(p) => edit_realm(p === $editing_realm_data && $editing_realm ? null : p)}
				{remove_realm}
			/>
		</div>
	{/if}
	<button
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
