<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';
	import {swallow} from '@feltjs/util/dom.js';

	import {create_project_id, ProjectDef, type ProjectId} from '$lib/earbetter/project';
	import {level_defs} from '$lib/earbetter/level_defs';

	const dispatch = createEventDispatcher<{submit: ProjectDef; remove: ProjectId}>();

	const DEFAULT_NAME = 'new project';

	export let project_def: ProjectDef | null = null;
	export let id = create_project_id();
	export let name = DEFAULT_NAME;
	export let editing = false;

	let removing = false;

	const to_data = (): ProjectDef => ({
		id,
		name,
		level_defs,
	});

	$: set_project_def(project_def);
	const set_project_def = (project_def: ProjectDef | null): void => {
		console.log(`set_project_def`, project_def);
		if (project_def) {
			id = project_def.id;
			name = project_def.name;
		} else {
			id = create_project_id(); // TODO duplicates work on first mount with no project_def, but not sure it's worth fixing, maybe there's a better pattern without this?
			name = DEFAULT_NAME;
		}
	};

	$: changed = !project_def || id !== project_def.id || name !== project_def.name;

	const import_data = async (): Promise<void> => {
		const data = to_data();
		const serialized = JSON.stringify(data);
		try {
			const imported = await import_project_data(serialized);
			if (imported) dispatch('submit', imported);
			// dispatch('submit', ProjectDef.parse(JSON.parse(imported)));
		} catch (err) {
			console.error('failed to import data', err);
		}
	};
</script>

<form class="project-def-form">
	<header>
		<h2>
			{#if editing}editing project{:else}create a new project{/if}
		</h2>
	</header>
	<fieldset>
		<label>
			<div class="title">name</div>
			<input
				bind:value={name}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						swallow(e);
						dispatch('submit', to_data());
					}
				}}
			/>
		</label>
	</fieldset>
	<fieldset>
		<label>
			<div class="title">id</div>
			<input disabled value={id} />
		</label>
	</fieldset>
	<button
		type="button"
		on:click={() => dispatch('submit', to_data())}
		disabled={editing && !changed}
	>
		{#if editing}save changes to project{:else}create project{/if}
	</button>
	<button type="button" on:click={import_data}>
		{#if editing}import/export data{:else}import data{/if}
	</button>
	{#if editing}
		<button type="button" on:click={() => (removing = !removing)}> remove project </button>
		{#if removing}
			<div transition:slide|local>
				<button
					class="w-full"
					type="button"
					on:click={() => {
						removing = false;
						dispatch('remove', id);
					}}
				>
					✖ confirm remove
				</button>
			</div>
		{/if}
	{/if}
	<slot name="footer" {changed} />
</form>
