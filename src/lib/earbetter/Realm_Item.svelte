<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {Realm_Data, Realm_Id} from '$lib/earbetter/realm.js';
	import Realm_Stats_Summary from '$lib/earbetter/Realm_Stats_Summary.svelte';
	import type {Project_Data} from '$lib/earbetter/project.js';

	export let realm_data: Realm_Data;
	export let project_data: Project_Data;
	export let select: ((id: Realm_Id) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((realm_data: Realm_Data | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: Realm_Id) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;
	export let editing: boolean;

	let removing = false;

	$: level_stats = project_data?.level_stats;
</script>

<li class="realm_item" transition:slide|local class:selected>
	{#if level_stats}
		<Realm_Stats_Summary {realm_data} {level_stats} />
	{/if}
	{#if select}
		<button class="realm-button" onclick={() => select?.(realm_data.id)} class:selected>
			{realm_data.name}
		</button>
	{/if}
	{#if (removing && remove) || (!removing && edit)}
		<button
			class="icon_button plain_button deselectable"
			class:selected={selected && !removing && editing}
			title={removing ? 'remove realm' : editing ? 'stop editing realm' : 'edit realm'}
			onclick={() => (removing ? remove?.(realm_data.id) : edit?.(realm_data))}
		>
			{#if removing}✖{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			class="icon_button plain_button"
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
	.realm-button {
		flex: 1;
	}
	.icon_button {
		font-size: var(--size_xl);
		width: var(--icon_button_width, 60px);
	}
</style>
