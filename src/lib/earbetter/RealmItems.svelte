<script lang="ts">
	import type { RealmData, RealmId } from './realm.ts';
	import RealmItem from './RealmItem.svelte';
	import type { ProjectData } from './project.ts';

	interface Props {
		selected_realm_data?: RealmData | null;
		editing_realm_id?: RealmId | null;
		realms?: Array<RealmData>;
		project_data: ProjectData;
		select_realm: (id: RealmId) => void;
		edit_realm: (realm_data: RealmData | null) => void;
		remove_realm: (id: RealmId) => void;
	}

	const {
		selected_realm_data = null,
		editing_realm_id = null,
		realms = [],
		project_data,
		select_realm,
		edit_realm,
		remove_realm
	}: Props = $props();

	// TODO refactor
	const realms_by_id = $derived(new Map(realms.map((r) => [r.id, r])));
	const lookup_realm_data = (id: RealmId): RealmData => realms_by_id.get(id)!;
</script>

<menu class="unstyled width_atmost_sm mb_0">
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
