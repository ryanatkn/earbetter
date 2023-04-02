<script lang="ts">
	import type {RealmData, RealmId} from '$lib/earbetter/realm';
	import RealmItem from '$lib/earbetter/RealmItem.svelte';
	import type {ProjectData} from '$lib/earbetter/project';

	export let selected_realm_data: RealmData | null = null;
	export let editing_realm_id: RealmId | null = null;
	export let realms: RealmData[] = [];
	export let project_data: ProjectData;
	export let select_realm: (id: RealmId) => void;
	export let edit_realm: (realm_data: RealmData | null) => void;
	export let remove_realm: (id: RealmId) => void;

	// TODO refactor
	$: realms_by_id = new Map(realms.map((r) => [r.id, r]));
	const lookup_realm_data = (id: RealmId): RealmData => realms_by_id.get(id)!;
</script>

<menu class="realms-list column-sm">
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
