<script lang="ts">
	import Realm_Form from '$lib/earbetter/Realm_Form.svelte';
	import type {App} from '$lib/earbetter/app.js';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		realms,
		selected_realm_data,
		editing_realm,
		editing_realm_data,
		remove_realm,
		duplicate_realm,
		update_realm,
		create_realm,
	} = app);

	let id: string;
	$: editing = $realms ? $realms.some((d) => d.id === id) : false;

	$: console.log(`$selected_realm_data`, $selected_realm_data);
	$: console.log(`$realms`, $realms);
</script>

<div class="panel p_md">
	<Realm_Form
		{editing}
		bind:id
		realm_data={$editing_realm_data}
		on:submit={(editing ? update_realm : create_realm)
			? (e) => (editing ? update_realm : create_realm)?.(e.detail)
			: undefined}
		on:remove={remove_realm ? (e) => remove_realm?.(e.detail) : undefined}
		on:duplicate={duplicate_realm ? (e) => duplicate_realm?.(e.detail) : undefined}
	>
		<svelte:fragment slot="footer" let:changed>
			{#if editing}
				<button type="button" onclick={() => (editing_realm.value = false)}>
					{#if changed}discard changes and stop editing{:else}stop editing this realm{/if}
				</button>
			{/if}
		</svelte:fragment>
	</Realm_Form>
</div>
