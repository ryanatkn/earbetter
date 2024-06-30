<script lang="ts">
	import type {Realm_Data, Realm_Id} from '$lib/earbetter/realm.js';
	import Realm_Item from '$lib/earbetter/Realm_Item.svelte';
	import type {Project_Data} from '$lib/earbetter/project.js';

	interface Props {
		selected_realm_data?: Realm_Data | null;
		editing_realm_id?: Realm_Id | null;
		realms?: Realm_Data[];
		project_data: Project_Data;
		select_realm: (id: Realm_Id) => void;
		edit_realm: (realm_data: Realm_Data | null) => void;
		remove_realm: (id: Realm_Id) => void;
	}

	const {
		selected_realm_data = null,
		editing_realm_id = null,
		realms = [],
		project_data,
		select_realm,
		edit_realm,
		remove_realm,
	}: Props = $props();

	// TODO refactor
	const realms_by_id = $derived(new Map(realms.map((r) => [r.id, r])));
	const lookup_realm_data = (id: Realm_Id): Realm_Data => realms_by_id.get(id)!;
</script>

<menu class="unstyled width_sm">
	{#each realms as realm (realm.id)}
		<Realm_Item
			realm_data={lookup_realm_data(realm.id)}
			{project_data}
			select={select_realm}
			edit={edit_realm}
			remove={remove_realm}
			selected={realm.id === selected_realm_data?.id}
			editing={realm.id === editing_realm_id}
		/>
	{/each}
</menu>
