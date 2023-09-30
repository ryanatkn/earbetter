<script lang="ts">
	import {z} from 'zod';
	import {effect, signal} from '@preact/signals-core';

	import Piano from '$lib/Piano.svelte';
	import {get_ac} from '$lib/ac';
	import {midi_access} from '$lib/midi_access';
	import MidiInput from '$lib/MidiInput.svelte';
	import {playing_notes, start_playing, stop_playing} from '$lib/play_note';
	import InitMidiButton from '$lib/InitMidiButton.svelte';
	import VolumeControl from '$lib/VolumeControl.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers';
	import InstrumentControl from '$lib/InstrumentControl.svelte';
	import MidiRangeControl from '$lib/MidiRangeControl.svelte';
	import {get_scale, get_key, get_enabled_notes, Midi} from '$lib/music';
	import SelectNotesControl from '$lib/SelectNotesControl.svelte';
	import {load_from_storage, set_in_storage} from '$lib/storage';

	// TODO extract? is pretty specific
	const PianoSettings = z.object({
		min_note: Midi.default(36),
		max_note: Midi.default(96),
	});
	type PianoSettings = z.infer<typeof PianoSettings>;
	const SITE_DATA_STORAGE_KEY = 'piano';
	const initial_piano_settings = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => PianoSettings.parse({}),
		PianoSettings.parse,
	);

	const min_note = signal(initial_piano_settings.min_note);
	const max_note = signal(initial_piano_settings.max_note);

	const to_piano_data = (): PianoSettings => ({
		min_note: min_note.value,
		max_note: max_note.value,
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

	let clientWidth: number; // `undefined` on first render

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		if (!$enabled_notes || $enabled_notes.has(note)) {
			start_playing(ac, note, with_velocity($volume, velocity), $instrument);
		}
	};
</script>

<svelte:head>
	<title>Earbetter: piano</title>
</svelte:head>

<MidiInput
	{midi_access}
	on:note_start={(e) => play(e.detail.note, e.detail.velocity)}
	on:note_stop={(e) => stop_playing(e.detail.note)}
/>
<main bind:clientWidth>
	<Header />
	<div class="piano-wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				min_note={$min_note}
				max_note={$max_note}
				{pressed_keys}
				enabled_notes={$enabled_notes}
				on:press={(e) => play(e.detail)}
				on:release={(e) => stop_playing(e.detail)}
			/>
		{/if}
	</div>
	<form class="column-sm prose panel padded_md">
		<fieldset>
			<InstrumentControl {instrument} />
			<div class="row">
				<SelectNotesControl {scale} {key} />
			</div>
			<VolumeControl {volume} />
		</fieldset>
		<fieldset>
			<InitMidiButton />
		</fieldset>
		<fieldset class="row">
			<MidiRangeControl {min_note} {max_note} />
		</fieldset>
	</form>
	<Footer />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.piano-wrapper {
		padding: var(--spacing_md);
	}
</style>
