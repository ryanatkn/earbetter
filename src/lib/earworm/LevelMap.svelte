<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import type {LevelDef, LevelId} from '$lib/earworm/level';
	import {create_level_stats} from '$lib/earworm/level_stats';
	import LevelMapItem from '$lib/earworm/LevelMapItem.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import LevelDefForm from '$lib/earworm/LevelDefForm.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import {get_volume} from '$lib/audio/helpers';

	export let midi_access: Signal<MIDIAccess | null>;
	export let level_def: LevelDef | null = null;
	export let level_defs: LevelDef[];
	export let play_level_def: ((id: LevelId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit_level_def: ((level_def: LevelDef | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove_level_def: ((id: LevelId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let create_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let update_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?

	const level_stats = create_level_stats(level_defs);
	$: ({stats} = level_stats);
	$: console.log('stats', $stats);
	console.log($stats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;
	const volume = get_volume();

	let set_level_def: (leve_def: LevelDef | null) => void;
	$: set_level_def?.(level_def);

	let id: string;
	$: editing = level_defs.some((d) => d.id === id);
</script>

<div class="map">
	<section class="panel padded-md markup column-sm">
		<header>
			<h2>controls</h2>
		</header>
		<p>
			Earworm does not yet function well on devices with smaller screens, see <a
				href="https://github.com/ryanatkn/earworm/issues/2">issue #2</a
			>.
		</p>
		<table>
			<tr>
				<td><code>Spacebar</code></td>
				<td>replay trial</td>
			</tr>
			<tr>
				<td><code>r</code></td>
				<td>restart level</td>
			</tr>
			<tr>
				<td><code>Escape</code></td>
				<td>exit level</td>
			</tr>
			<tr>
				<td><code>c</code></td>
				<td>connect MIDI</td>
			</tr>
			<tr>
				<td><code>up/down arrows</code></td>
				<td>adjust volume</td>
			</tr>
			<tr>
				<td><code>` Backtick</code></td>
				<td>cheat</td>
			</tr>
		</table>
		<VolumeControl {volume} />
		<p>
			Earworm supports MIDI devices like piano keyboards. Connect a device and click the button
			below:
		</p>
		<InitMidiButton {midi_access} />
	</section>
	<section class="panel padded-md column-sm">
		<header class="markup">
			<h2>ear training levels</h2>
		</header>
		<div class="levels column-sm">
			{#each level_defs as d (d.id)}
				<LevelMapItem
					level_def={d}
					select={play_level_def}
					edit={edit_level_def}
					remove={remove_level_def}
					selected={d === level_def}
					completed={$stats.completed[d.id]}
				/>
			{/each}
		</div>
	</section>
	<section class="panel padded-md markup column-sm">
		<LevelDefForm
			{editing}
			bind:id
			bind:set_level_def
			{level_def}
			on:submit={(editing ? update_level_def : create_level_def)
				? (e) => (editing ? update_level_def : create_level_def)?.(e.detail)
				: undefined}
			on:remove={remove_level_def ? (e) => remove_level_def?.(e.detail) : undefined}
		>
			<svelte:fragment slot="footer" let:changed>
				{#if editing && edit_level_def}
					<button type="button" on:click={() => play_level_def?.(id)}> play! </button>
					<button type="button" on:click={() => edit_level_def?.(null)}>
						{#if changed}discard changes and stop editing{:else}stop editing this level{/if}
					</button>
				{/if}
			</svelte:fragment>
		</LevelDefForm>
	</section>
</div>

<style>
	.map {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: flex-start;
	}
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: var(--spacing_md);
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: var(--spacing_xl5) var(--spacing_xl);
	}
	@media (max-width: 1111px) {
		.map {
			flex-direction: column;
			align-items: center;
		}
		section {
			margin: var(--spacing_xl5) 0;
		}
	}
</style>
