<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import RealmForm from './RealmForm.svelte';
	import type { App } from './app.svelte.ts';
	import { RealmData } from './realm.ts';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const { app }: Props = $props();

	const { remove_realm, duplicate_realm, update_realm, create_realm } = $derived(app);

	const realm_data = $derived(app.editing_realm_data ?? s.parse_or_throw(RealmData, {}));

	const editing = $derived(app.realms ? app.realms.some((d) => d.id === realm_data.id) : false);

	// $inspect(`app.selected_realm_data`, app.selected_realm_data);
	// $inspect(`app.realms`, app.realms);

	const update_or_create = (r: RealmData, select: boolean) => {
		if (app.realms?.some((d) => d.id === r.id)) {
			update_realm(r);
		} else {
			create_realm(r, select);
		}
	};
</script>

<div class="panel p_md">
	<RealmForm
		{editing}
		{realm_data}
		onsubmit={(data) => {
			if (Array.isArray(data)) {
				for (const [i, d] of data.entries()) {
					update_or_create(d, i === 0);
				}
			} else {
				update_or_create(data, true);
			}
		}}
		onremove={(realm_id) => remove_realm(realm_id)}
		onduplicate={(realm_id) => duplicate_realm(realm_id)}
		onclose={() => (app.editing_realm = false)}
	/>
</div>
