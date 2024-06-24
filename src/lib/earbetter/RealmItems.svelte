<script lang="ts">
	import type {Realm_Data, Realm_Id} from '$lib/earbetter/realm.js';
	import RealmItem from '$lib/earbetter/RealmItem.svelte';
	import type {Project_Data} from '$lib/earbetter/project.js';

	export let selected_realm_data: Realm_Data | null = null;
	export let editing_realm_id: Realm_Id | null = null;
	export let realms: Realm_Data[] = [];
	export let project_data: Project_Data;
	export let select_realm: (id: Realm_Id) => void;
	export let edit_realm: (realm_data: Realm_Data | null) => void;
	export let remove_realm: (id: Realm_Id) => void;

	// TODO refactor
	$: realms_by_id = new Map(realms.map((r) => [r.id, r]));
	const lookup_realm_data = (id: Realm_Id): Realm_Data => realms_by_id.get(id)!;
</script>

<menu class="realms-list width_sm">
	{#each realms as realm (realm.id)}
		<RealmItem
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
