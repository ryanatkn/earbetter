<script lang="ts">
	import type {LevelDef, LevelId} from '$lib/earworm/level';
	import {create_level_stats} from '$lib/earworm/level_stats';
	import LevelMapItem from '$lib/earworm/LevelMapItem.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import type MidiInput from '$lib/audio/MidiInput.svelte';
	import InitMidiButton from '$lib/music/InitMidiButton.svelte';
	import LevelDefForm from '$lib/earworm/LevelDefForm.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import {get_volume} from '$lib/audio/helpers';

	export let midi_input: MidiInput;
	export let level_def: LevelDef | null = null;
	export let level_defs: LevelDef[];
	export let select_level_def: ((id: LevelId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit_level_def: ((level_def: LevelDef | null) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove_level_def: ((id: LevelId) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let create_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let update_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?

	const level_stats = create_level_stats(level_defs);
	$: console.log('stats', $level_stats);
	console.log($level_stats);

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
		<p>Earworm may not function well on devices with smaller screens.</p>
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
				<td><code>` Backtick</code></td>
				<td>cheat</td>
			</tr>
		</table>
		<VolumeControl {volume} />
		<p>
			Earworm supports MIDI devices like piano keyboards. Connect a device and click the button
			below:
		</p>
		<InitMidiButton {midi_input} />
	</section>
	<section class="panel padded-md">
		<header class="markup">
			<h2>ear training levels</h2>
		</header>
		<div class="levels column-sm">
			{#each level_defs as d (d.id)}
				<LevelMapItem
					level_def={d}
					select={select_level_def}
					edit={edit_level_def}
					remove={remove_level_def}
					selected={d === level_def}
					completed={$level_stats.completed[d.id]}
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
			<svelte:fragment slot="footer">
				{#if editing && edit_level_def}
					<button type="button" on:click={() => edit_level_def?.(null)}>
						stop editing this level
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
