<script lang="ts">
	import Realm_Form from '$lib/earbetter/Realm_Form.svelte';
	import type {App} from '$lib/earbetter/app.svelte.js';
	import {Realm_Data} from '$lib/earbetter/realm.js';

	interface Props {
		app: App; // TODO maybe change to be more granular objects?
	}

	const {app}: Props = $props();

	const {remove_realm, duplicate_realm, update_realm, create_realm} = $derived(app);

	const realm_data = $derived(app.editing_realm_data ?? Realm_Data.parse({}));

	const editing = $derived(app.realms ? app.realms.some((d) => d.id === realm_data.id) : false);

	// $inspect(`app.selected_realm_data`, app.selected_realm_data);
	// $inspect(`app.realms`, app.realms);

	const update_or_create = (r: Realm_Data, select: boolean) => {
		if (app.realms?.some((d) => d.id === r.id)) {
			update_realm(r);
		} else {
			create_realm(r, select);
		}
	};
</script>

<div class="panel p_md">
	<Realm_Form
		{editing}
		{realm_data}
		onsubmit={(data) => {
			if (Array.isArray(data)) {
				for (let i = 0; i < data.length; i++) {
					update_or_create(data[i], i === 0);
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
