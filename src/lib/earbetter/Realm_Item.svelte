<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {Realm_Data, Realm_Id} from '$lib/earbetter/realm.js';
	import Realm_Stats_Summary from '$lib/earbetter/Realm_Stats_Summary.svelte';
	import type {Project_Data} from '$lib/earbetter/project.js';

	interface Props {
		realm_data: Realm_Data;
		project_data: Project_Data;
		select?: ((id: Realm_Id) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		edit?: ((realm_data: Realm_Data | null) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
		remove?: ((id: Realm_Id) => void) | null; // TODO event? or is the ability to have a return value for ephemeral state desired?
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
		editing,
	}: Props = $props();

	let removing = $state(false);

	const level_stats = $derived(project_data.level_stats);

	// TODO BLOCK bug not showing the edit button
</script>

<li class="realm_item" transition:slide class:selected>
	{#if level_stats}
		<Realm_Stats_Summary {realm_data} {level_stats} />
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
			class="icon_button plain_button size_xl deselectable"
			class:selected={selected && !removing && editing}
			title={removing ? 'remove realm' : editing ? 'stop editing realm' : 'edit realm'}
			onclick={() => (removing ? remove?.(realm_data.id) : edit?.(realm_data))}
		>
			{#if removing}✖{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			type="button"
			class="icon_button plain_button size_xl"
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
		width: 100%;
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
