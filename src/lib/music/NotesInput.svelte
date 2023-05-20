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
	import MidiRangeControl from '$lib/audio/MidiRangeControl.svelte';
	import {
		get_scale,
		get_key,
		get_enabled_notes,
		Midi,
		serialize_notes,
		Notes,
	} from '$lib/music/music';
	import SelectNotesControl from '$lib/music/SelectNotesControl.svelte';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';

	const dispatch = createEventDispatcher<{
		input: Notes | null;
	}>();

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
	const scale = get_scale();
	const key = get_key();
	const enabled_notes = get_enabled_notes();

	$: pressed_keys = $playing_notes;

	// TODO hacky
	let innerWidth: number; // `undefined` on first render

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		if (!$enabled_notes || $enabled_notes.has(note)) {
			start_playing(ac, note, with_velocity($volume, velocity), $instrument);
		}
	};

	$: enabled_notes_array = $enabled_notes ? Array.from($enabled_notes) : null;

	// TODO BLOCK scope by lowest/highest MIDI key
</script>

<svelte:window bind:innerWidth />

<MidiInput
	{midi_access}
	on:note_start={(e) => play(e.detail.note, e.detail.velocity)}
	on:note_stop={(e) => stop_playing(e.detail.note)}
/>

<div class="notes_input">
	{#if enabled_notes_array}
		<div class="notes column-sm markup">
			<!-- TODO copy button -->
			<blockquote class="panel">
				{serialize_notes(enabled_notes_array)}
			</blockquote>
			<button
				type="button"
				on:click={(e) => {
					swallow(e);
					dispatch('input', enabled_notes_array);
				}}
				>select these {enabled_notes_array ? enabled_notes_array.length + ' ' : ''}tonic{plural(
					enabled_notes_array?.length,
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
				enabled_notes={$enabled_notes}
				on:press={(e) => play(e.detail)}
				on:release={(e) => stop_playing(e.detail)}
			/>
		{/if}
	</div>
	<form class="column-sm markup panel padded-md">
		<fieldset>
			<div class="row">
				<MidiRangeControl {note_min} {note_max} />
			</div>
			<div class="row">
				<SelectNotesControl {scale} {key} />
			</div>
		</fieldset>
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
		/* max-width: 100%; */
	}
	.notes {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.piano_wrapper {
		padding: var(--spacing_md);
	}
</style>
