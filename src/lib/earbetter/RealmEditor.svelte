<script lang="ts">
	import {slide} from 'svelte/transition';

	import RealmForm from '$lib/earbetter/RealmForm.svelte';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		realm_defs,
		selected_realm_def,
		editing_realm,
		editing_realm_def,
		remove_realm,
		update_realm,
		create_realm,
	} = app);

	let id: string;
	$: editing = $realm_defs ? $realm_defs.some((d) => d.id === id) : false;

	$: console.log(`$selected_realm_def`, $selected_realm_def);
	$: console.log(`$realm_defs`, $realm_defs);

	$: no_realms = !$realm_defs?.length;
</script>

{#if ($editing_realm && $editing_realm_def) || no_realms}
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
