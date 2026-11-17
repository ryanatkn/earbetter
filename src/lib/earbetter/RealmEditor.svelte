<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import RealmForm from './RealmForm.svelte';
	import { app_context } from './app.svelte.ts';
	import { RealmData } from './realm.ts';

	const app = app_context.get();

	const { remove_realm, duplicate_realm, update_realm, create_realm } = app;

	const realm_data = $derived(app.editing_realm_data ?? s.parse_or_throw(RealmData, {}));

	const editing = $derived(app.realms ? app.realms.some((d) => d.id === realm_data.id) : false);

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
		onremove={remove_realm}
		onduplicate={duplicate_realm}
		onclose={() => (app.editing_realm = false)}
	/>
</div>
