<script lang="ts">
	import {z} from 'zod';
	import {effect, signal} from '@preact/signals-core';
	import {plural, swallow} from '@feltjs/util';
	import {createEventDispatcher} from 'svelte';

	import Piano from '$lib/music/Piano.svelte';
	import {get_ac} from '$lib/audio/ac';
	import {midi_access} from '$lib/audio/midi_access';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import {playing_notes, start_playing, stop_playing} from '$lib/audio/play_note';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/audio/helpers';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';
	import {Midi, serialize_notes, Notes, scales, Scale} from '$lib/music/music';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';

	const dispatch = createEventDispatcher<{
		input: Notes | null;
	}>();

	export let notes: Set<Midi> | null;

	// TODO this is hacky, does a double conversion with the parent component, see the comment at the usage site
	let notes_set: Set<Midi> | null = notes;
	$: notes_set = notes;
	let notes_array: Notes | null = notes_set ? Array.from(notes_set).sort((a, b) => a - b) : null;
	$: notes_array = notes_set ? Array.from(notes_set).sort((a, b) => a - b) : null;

	// TODO lots of copypasta below

	// TODO extract? is pretty specific
	const PianoSettings = z.object({
		note_min: Midi.default(36),
		note_max: Midi.default(96),
	});
	type PianoSettings = z.infer<typeof PianoSettings>;
	const SITE_DATA_STORAGE_KEY = 'piano';
	const initial_piano_settings = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => PianoSettings.parse({}),
		PianoSettings.parse,
	);

	const note_min = signal(initial_piano_settings.note_min);
	const note_max = signal(initial_piano_settings.note_max);

	const to_piano_data = (): PianoSettings => ({
		note_min: note_min.value,
		note_max: note_max.value,
	});
	const save_piano_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_piano_data());
	effect(save_piano_data);

	const ac = get_ac();
	const volume = get_volume();
	const instrument = get_instrument();

	$: pressed_keys = $playing_notes;

	// TODO hacky
	let innerWidth: number; // `undefined` on first render

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		if (!notes_set || notes_set.has(note)) {
			start_playing(ac, note, with_velocity($volume, velocity), $instrument);
		}
	};

	// TODO BLOCK scope by lowest/highest MIDI key
	// TODO BLOCK calculate the notes for the scale across the lowest/highest MIDI

	const toggle_scale = (scale: Scale): void => {
		const scale_notes = scale.notes;
		// TODO this is a hacky and slow but it approximates the desired UX, is not ideal,
		// I think the best UX would be to detect if each scale is currently fully active
		if (!notes_array) {
			notes_array = scale_notes.slice();
			return;
		}
		let fully_included = true;
		for (const n of scale_notes) {
			if (!notes_array.includes(n)) {
				fully_included = false;
				break;
			}
		}
		const next_notes = fully_included
			? notes_array.filter((n) => !scale_notes.includes(n))
			: notes_array.concat(scale_notes);
		notes_set = new Set(next_notes);
	};
</script>

<svelte:window bind:innerWidth />

<MidiInput
	{midi_access}
	on:note_start={(e) => play(e.detail.note, e.detail.velocity)}
	on:note_stop={(e) => stop_playing(e.detail.note)}
/>

<div class="notes_input">
	{#if notes_array}
		<div class="notes column-sm markup">
			<!-- TODO copy button -->
			<blockquote class="panel">
				{serialize_notes(notes_array)}
			</blockquote>
			<button
				type="button"
				class="accent"
				on:click={(e) => {
					swallow(e);
					dispatch('input', notes_array);
				}}
				>select these {notes_array ? notes_array.length + ' ' : ''}tonic{plural(
					notes_array?.length,
				)}</button
			>
		</div>
	{/if}
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if innerWidth}
			<Piano
				width={innerWidth - piano_padding * 2}
				note_min={$note_min}
				note_max={$note_max}
				{pressed_keys}
				enabled_notes={notes_set}
				on:press={(e) => play(e.detail)}
				on:release={(e) => stop_playing(e.detail)}
			/>
		{/if}
	</div>
	<section class="scales">
		{#each scales as scale (scale.name)}
			<button on:click={() => toggle_scale(scale)}>{scale.name}</button>
		{/each}
	</section>
	<form class="column-sm markup panel padded-md">
		<fieldset>
			<InstrumentControl {instrument} />
			<VolumeControl {volume} />
		</fieldset>
		<fieldset>
			<InitMidiButton />
		</fieldset>
	</form>
</div>

<style>
	.notes_input {
		width: var(--notes_input_width, auto);
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.notes {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.piano_wrapper {
		padding: var(--spacing_md);
	}
	.scales {
		display: flex;
		flex-wrap: wrap;
		max-width: var(--column_width);
		justify-content: center;
	}
</style>
