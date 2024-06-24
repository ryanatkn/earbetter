<script lang="ts">
	import Project_Form from '$lib/earbetter/Project_Form.svelte';
	import type {App} from '$lib/earbetter/app.js';

	export let app: App; // TODO maybe change to be more granular objects?

	$: ({
		project_datas: projects,
		editing_project,
		editing_project_data,
		remove_project,
		duplicate_project,
		update_project,
		create_project,
	} = app);

	let id: string;
	$: editing = $projects.some((d) => d.id === id);
</script>

<div class="panel p_md">
	<Project_Form
		{editing}
		bind:id
		project_data={$editing_project_data}
		onsubmit={(editing ? update_project : create_project)
			? (e) => (editing ? update_project : create_project)?.(e.detail)
			: undefined}
		onremove={remove_project ? (e) => remove_project?.(e.detail) : undefined}
		onduplicate={duplicate_project ? (e) => duplicate_project?.(e.detail) : undefined}
	>
		<svelte:fragment slot="footer" let:changed>
			{#if editing}
				<button type="button" onclick={() => (editing_project.value = false)}>
					{#if changed}discard changes and stop editing{:else}stop editing this project{/if}
				</button>
			{/if}
		</svelte:fragment>
	</Project_Form>
</div>
