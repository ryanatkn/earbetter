<script lang="ts">
	import Realm_Form from '$lib/earbetter/Realm_Form.svelte';
	import type {App} from '$lib/earbetter/app.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {
		realms,
		selected_realm_data,
		editing_realm,
		editing_realm_data,
		remove_realm,
		duplicate_realm,
		update_realm,
		create_realm,
	} = $derived(app);

	let id: string | undefined = $state();
	const editing = $derived($realms ? $realms.some((d) => d.id === id) : false);

	$inspect(`$selected_realm_data`, $selected_realm_data);
	$inspect(`$realms`, $realms);
</script>

<div class="panel p_md">
	<Realm_Form
		{editing}
		bind:id
		realm_data={$editing_realm_data}
		onsubmit={(editing ? update_realm : create_realm)
			? (realm_data) => (editing ? update_realm : create_realm)?.(realm_data)
			: undefined}
		onremove={remove_realm ? (realm_id) => remove_realm?.(realm_id) : undefined}
		onduplicate={duplicate_realm ? (realm_id) => duplicate_realm?.(realm_id) : undefined}
	>
		{#snippet footer(changed)}
			{#if editing}
				<button type="button" onclick={() => (editing_realm.value = false)}>
					{#if changed}discard changes and stop editing{:else}stop editing this realm{/if}
				</button>
			{/if}
		{/snippet}
	</Realm_Form>
</div>
