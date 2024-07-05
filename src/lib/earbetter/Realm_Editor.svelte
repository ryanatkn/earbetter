<script lang="ts">
	import Realm_Form from '$lib/earbetter/Realm_Form.svelte';
	import type {App} from '$lib/earbetter/app.js';
	import {Realm_Data} from '$lib/earbetter/realm.js';

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

	const realm_data = $derived($editing_realm_data ?? Realm_Data.parse({}));

	const editing = $derived($realms ? $realms.some((d) => d.id === realm_data.id) : false);

	$inspect(`$selected_realm_data`, $selected_realm_data);
	$inspect(`$realms`, $realms);
</script>

<div class="panel p_md">
	<Realm_Form
		{editing}
		{realm_data}
		onsubmit={editing ? update_realm : create_realm}
		onremove={(realm_id) => remove_realm(realm_id)}
		onduplicate={(realm_id) => duplicate_realm(realm_id)}
		onclose={() => (editing_realm.value = false)}
	/>
</div>
