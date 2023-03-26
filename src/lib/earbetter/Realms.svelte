<script lang="ts">
	import {create_realm_def} from '$lib/earbetter/realm';
	import RealmItems from '$lib/earbetter/RealmItems.svelte';
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
	} = app);

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
		<RealmItems
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

<style>
	.create-new-realm {
		margin: var(--spacing_md) 0;
		width: 100%;
	}
</style>
