<script lang="ts">
	import {slide} from 'svelte/transition';

	import {create_realm_def} from '$lib/earbetter/realm';
	import RealmForm from '$lib/earbetter/RealmForm.svelte';
	import RealmsList from '$lib/earbetter/RealmsList.svelte';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		realm_defs,
		selected_realm_def,
		editing_realm,
		editing_realm_def,
		select_realm,
		edit_realm,
		remove_realm,
		update_realm,
		create_realm,
	} = app);

	let id: string;
	$: editing = $realm_defs ? $realm_defs.some((d) => d.id === id) : false;

	$: creating =
		$editing_realm && !!$editing_realm_def && $selected_realm_def?.id !== $editing_realm_def?.id;

	$: console.log(`$selected_realm_def`, $selected_realm_def);
	$: console.log(`$realm_defs`, $realm_defs);
</script>

{#if $selected_realm_def && $realm_defs}
	<section class="panel padded-md column-sm">
		<div class="markup">
			<header>
				<h2>realms</h2>
			</header>
		</div>
		<RealmsList
			selected_realm_def={$selected_realm_def}
			realm_defs={$realm_defs}
			{select_realm}
			edit_realm={(p) => edit_realm(!p || p === $editing_realm_def ? null : p.id)}
			{remove_realm}
		/>
		<button
			class="create-new-realm deselectable"
			class:selected={creating}
			on:click={() => {
				if (creating) {
					editing_realm.value = false;
				} else {
					editing_realm_def.value = create_realm_def();
					editing_realm.value = true;
				}
			}}
		>
			create a new realm
		</button>
	</section>
{/if}
{#if ($editing_realm && $editing_realm_def) || !$selected_realm_def}
	<section class="panel padded-md column-sm markup" transition:slide|local>
		<RealmForm
			{editing}
			bind:id
			realm_def={$editing_realm_def}
			on:submit={(editing ? update_realm : create_realm)
				? (e) => (editing ? update_realm : create_realm)?.(e.detail)
				: undefined}
			on:remove={remove_realm ? (e) => remove_realm?.(e.detail) : undefined}
		>
			<svelte:fragment slot="footer" let:changed>
				{#if editing}
					<button type="button" on:click={() => (editing_realm.value = false)}>
						{#if changed}discard changes and stop editing{:else}stop editing this realm{/if}
					</button>
				{/if}
			</svelte:fragment>
		</RealmForm>
	</section>
{/if}

<style>
	.create-new-realm {
		margin: var(--spacing_md) 0;
		width: 100%;
	}
</style>
