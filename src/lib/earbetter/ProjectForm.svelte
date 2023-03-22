<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';

	import {create_project_id, ProjectDef, type ProjectId} from '$lib/earbetter/project';

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
	});

	export const set_project_def = (project_def: ProjectDef | null): void => {
		if (project_def) {
			id = project_def.id;
			name = project_def.name;
		} else {
			id = create_project_id();
			name = DEFAULT_NAME;
		}
	};

	$: changed = !project_def || id !== project_def.id || name !== project_def.name;

	const import_data = () => {
		const data = to_data();
		const serialized = JSON.stringify(data);
		// TODO refactor
		const imported = prompt('data for this project: ', serialized); // eslint-disable-line no-alert
		if (imported) {
			try {
				set_project_def(ProjectDef.parse(JSON.parse(imported)));
			} catch (err) {
				console.error('failed to parse', err, imported);
			}
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
			<input bind:value={name} />
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
