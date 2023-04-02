<script lang="ts">
	import type {RealmDef, RealmId} from '$lib/earbetter/realm';
	import RealmItem from '$lib/earbetter/RealmItem.svelte';
	import type {ProjectData} from '$lib/earbetter/project';

	export let selected_realm_def: RealmDef | null = null;
	export let editing_realm_id: RealmId | null = null;
	export let realm_defs: RealmDef[] = [];
	export let project_data: ProjectData;
	export let select_realm: (id: RealmId) => void;
	export let edit_realm: (realm_def: RealmDef | null) => void;
	export let remove_realm: (id: RealmId) => void;

	// TODO refactor
	$: realm_defs_by_id = new Map(realm_defs.map((r) => [r.id, r]));
	const lookup_realm_def = (id: RealmId): RealmDef => realm_defs_by_id.get(id)!;
</script>

<menu class="realms-list column-sm">
	{#each realm_defs as realm (realm.id)}
		<RealmItem
			realm_def={lookup_realm_def(realm.id)}
			{project_data}
			select={select_realm}
			edit={edit_realm}
			remove={remove_realm}
			selected={realm.id === selected_realm_def?.id}
			editing={realm.id === editing_realm_id}
		/>
	{/each}
</menu>
