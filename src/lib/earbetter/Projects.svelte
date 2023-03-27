<script lang="ts">
	import {slide} from 'svelte/transition';

	import {create_project_def} from '$lib/earbetter/project';
	import ProjectForm from '$lib/earbetter/ProjectForm.svelte';
	import ProjectItems from '$lib/earbetter/ProjectItems.svelte';
	import type {App} from '$lib/earbetter/app';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		app_data,
		project_defs,
		selected_project_id,
		selected_project_def,
		editing_project,
		editing_project_id,
		editing_project_def,
		load_project,
		select_project,
		edit_project,
		remove_project,
		update_project,
		create_project,
	} = app);

	let id: string;
	$: editing = $project_defs.some((d) => d.id === id);

	$: creating = $editing_project && $selected_project_id !== $editing_project_id;

	$: ({projects} = $app_data);
</script>

{#if $selected_project_def}
	<section class="card column-sm">
		<div class="panel padded-md">
			<div class="markup">
				<header>
					<h2>projects</h2>
				</header>
			</div>
			<ProjectItems
				selected_project_id={$selected_project_id}
				editing_project_id={$editing_project ? $editing_project_id : null}
				{projects}
				project_defs={$project_defs}
				{load_project}
				{select_project}
				edit_project={(p) =>
					edit_project(p === $editing_project_def && $editing_project ? null : p)}
				{remove_project}
			/>
			<button
				class="create-new-project deselectable"
				class:selected={creating}
				on:click={() => {
					if (creating) {
						editing_project.value = false;
					} else {
						edit_project(create_project_def());
					}
				}}
			>
				create a new project
			</button>
		</div>
	</section>
{/if}
{#if ($editing_project && $editing_project_def) || !$selected_project_def}
	<section class="card column-sm" transition:slide|local>
		<div class="panel padded-md markup">
			<ProjectForm
				{editing}
				bind:id
				project_def={$editing_project_def}
				on:submit={(editing ? update_project : create_project)
					? (e) => (editing ? update_project : create_project)?.(e.detail)
					: undefined}
				on:remove={remove_project ? (e) => remove_project?.(e.detail) : undefined}
			>
				<svelte:fragment slot="footer" let:changed>
					{#if editing}
						<button type="button" on:click={() => (editing_project.value = false)}>
							{#if changed}discard changes and stop editing{:else}stop editing this project{/if}
						</button>
					{/if}
				</svelte:fragment>
			</ProjectForm>
		</div>
	</section>
{/if}

<style>
	.create-new-project {
		margin: var(--spacing_md) 0;
		width: 100%;
	}
</style>
