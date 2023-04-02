<script lang="ts">
	import {slide} from 'svelte/transition';

	import {RealmDef} from '$lib/earbetter/realm';
	import RealmItems from '$lib/earbetter/RealmItems.svelte';
	import type {App} from '$lib/earbetter/app';
	import default_project_data from '$lib/projects/default-project';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		selected_project_data,
		realm_defs,
		selected_realm_def,
		editing_realm,
		editing_realm_id,
		editing_realm_def,
		select_realm,
		create_realm,
		edit_realm,
		remove_realm,
	} = app);

	$: creating =
		$editing_realm && !!$editing_realm_def && $selected_realm_def?.id !== $editing_realm_def?.id;

	$: no_realms = !$realm_defs?.length;

	const click_create_new = () => {
		if (no_realms) {
			(document.querySelector('.realm-def-form input') as HTMLInputElement | null)?.focus?.();
		} else if (creating) {
			editing_realm.value = false;
		} else {
			edit_realm(RealmDef.parse({}));
		}
	};
</script>

<div class="panel padded-md">
	<div class="markup">
		<header>
			<h2>realms</h2>
		</header>
	</div>
	{#if $realm_defs && $selected_project_data}
		<div class="realm-items-wrapper" transition:slide|local>
			<RealmItems
				project_data={$selected_project_data}
				selected_realm_def={$selected_realm_def}
				realm_defs={$realm_defs}
				editing_realm_id={$editing_realm ? $editing_realm_id : null}
				{select_realm}
				edit_realm={(p) => edit_realm(p === $editing_realm_def && $editing_realm ? null : p)}
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
	{#if no_realms}
		<div class="create-default-realms-wrapper" transition:slide|local>
			<button
				on:click={() => {
					for (const realm_def of default_project_data().realm_defs) {
						create_realm(realm_def);
					}
				}}
			>
				create default realms
			</button>
		</div>
	{/if}
</div>

<style>
	button {
		width: 100%;
	}
	.create-default-realms-wrapper {
		/* need a wrapper with padding because of the transition */
		padding-top: var(--spacing_md);
	}
	.realm-items-wrapper {
		padding-bottom: var(--spacing_md);
	}
</style>
