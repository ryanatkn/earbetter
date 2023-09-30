<script lang="ts">
	import {slide} from 'svelte/transition';

	import {RealmData} from '$lib/earbetter/realm';
	import RealmItems from '$lib/earbetter/RealmItems.svelte';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		selected_project_data,
		realms,
		selected_realm_data,
		editing_realm,
		editing_realm_id,
		editing_realm_data,
		select_realm,
		edit_realm,
		remove_realm,
	} = app);

	$: creating =
		$editing_realm && !!$editing_realm_data && $selected_realm_data?.id !== $editing_realm_data?.id;

	$: no_realms = !$realms?.length;

	const click_create_new = () => {
		if (no_realms) {
			// eslint bug
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			(document.querySelector('.realm-def-form input') as HTMLInputElement | null)?.focus?.();
		} else if (creating) {
			editing_realm.value = false;
		} else {
			edit_realm(RealmData.parse({}));
		}
	};
</script>

<div class="panel padded-md">
	<div class="markup">
		<header>
			<h2>realms</h2>
		</header>
	</div>
	{#if $realms && $selected_project_data}
		<div class="realm-items-wrapper" transition:slide|local>
			<RealmItems
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
		on:click={click_create_new}
	>
		create a new realm
	</button>
</div>

<style>
	button {
		width: 100%;
	}
	.realm-items-wrapper {
		padding-bottom: var(--spacing_md);
	}
</style>
