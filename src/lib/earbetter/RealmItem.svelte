<script lang="ts">
	import {slide} from 'svelte/transition';

	import type {RealmDef, RealmId} from '$lib/earbetter/realm';

	export let realm_def: RealmDef;
	export let select: ((id: RealmId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit: ((realm_def: RealmDef | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove: ((id: RealmId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let selected: boolean;

	let removing = false;

	$: editing = !removing && edit;
</script>

<li class="realm-item" transition:slide|local>
	{#if select}
		<button class="realm-button" on:click={() => select?.(realm_def.id)} class:selected>
			{realm_def.name}
		</button>
	{/if}
	{#if (removing && remove) || editing}
		<button
			class="icon-button plain-button deselectable"
			class:selected={selected && !removing}
			class:editing
			title={removing ? 'remove realm' : 'edit realm'}
			on:click={() => (removing ? remove?.(realm_def.id) : edit?.(realm_def))}
		>
			{#if removing}✖{:else}✎{/if}
		</button>
	{/if}
	{#if remove}
		<button
			class="icon-button plain-button"
			on:click={() => (removing = !removing)}
			title={removing ? 'cancel removing' : 'remove realm'}
		>
			{#if removing}×{:else}✕{/if}
		</button>
	{/if}
</li>

<style>
	li {
		width: 100%;
	}
	.plain-button:not(.selected.editing) {
		visibility: hidden;
	}
	.realm-item:hover .plain-button {
		visibility: visible;
	}
	.realm-button {
		flex: 1;
	}
	.icon-button {
		font-size: var(--font_size_xl);
	}
</style>
