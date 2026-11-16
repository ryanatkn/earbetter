<script lang="ts">
	import { slide } from 'svelte/transition';

	import type { RealmData, RealmId } from './realm.ts';
	import RealmStatsSummary from './RealmStatsSummary.svelte';
	import type { ProjectData } from './project.ts';

	interface Props {
		realm_data: RealmData;
		project_data: ProjectData;
		select?: ((id: RealmId) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		edit?: ((realm_data: RealmData | null) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		remove?: ((id: RealmId) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		selected: boolean;
		editing: boolean;
	}

	const {
		realm_data,
		project_data,
		select = null,
		edit = null,
		remove = null,
		selected,
		editing
	}: Props = $props();

	let removing = $state(false);

	const level_stats = $derived(project_data.level_stats);
</script>

<li class="realm_item" transition:slide class:selected>
	{#if level_stats}
		<RealmStatsSummary {realm_data} {level_stats} />
	{/if}
	{#if select}
		<button type="button" class="realm_button" onclick={() => select(realm_data.id)} class:selected>
			{realm_data.name}
		</button>
	{/if}
	<!-- TODO this is a bug in the eslint plugin -->
	<!-- eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -->
	{#if (removing && remove) || (!removing && edit)}
		<button
			type="button"
			class="icon_button plain_button font_size_xl deselectable"
			class:selected={selected && !removing && editing}
			class:palette_c={removing}
			title={removing ? 'remove realm' : editing ? 'stop editing realm' : 'edit realm'}
			onclick={() => (removing ? remove?.(realm_data.id) : edit?.(realm_data))}
		>
			{#if removing}✕{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			type="button"
			class="icon_button plain_button font_size_xl"
			onclick={() => (removing = !removing)}
			title={removing ? 'cancel removing' : 'remove realm'}
		>
			{#if removing}×{:else}✕{/if}
		</button>
	{/if}
</li>

<style>
	.realm_item {
		display: flex;
		align-items: center;
		width: 100%;
		margin-bottom: var(--space_md);
	}
	.plain_button:not(.selected) {
		visibility: hidden;
	}
	.realm_item:hover .plain_button,
	li.selected .plain_button {
		visibility: visible;
	}
	.realm_button {
		flex: 1;
	}
</style>
