<script lang="ts">
	import {z} from 'zod';
	import {effect, signal} from '@preact/signals-core';

	import Piano from '$lib/Piano.svelte';
	import {get_ac} from '$lib/ac.js';
	import {midi_access} from '$lib/midi_access.js';
	import Midi_Input from '$lib/Midi_Input.svelte';
	import {playing_notes, start_playing, stop_playing} from '$lib/play_note.js';
	import Init_Midi_Button from '$lib/Init_Midi_Button.svelte';
	import Volume_Control from '$lib/Volume_Control.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers.js';
	import Instrument_Control from '$lib/Instrument_Control.svelte';
	import Midi_Range_Control from '$lib/Midi_Range_Control.svelte';
	import {get_scale, get_key, get_enabled_notes, Midi} from '$lib/music.js';
	import Select_Notes_Control from '$lib/Select_Notes_Control.svelte';
	import {load_from_storage, set_in_storage} from '$lib/storage.js';

	// TODO extract? is pretty specific
	const Piano_Settings = z.object({
		min_note: Midi.default(36),
		max_note: Midi.default(96),
	});
	type Piano_Settings = z.infer<typeof Piano_Settings>;
	const SITE_DATA_STORAGE_KEY = 'piano';
	const initial_piano_settings = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => Piano_Settings.parse({}),
		Piano_Settings.parse,
	);

	const min_note = signal(initial_piano_settings.min_note);
	const max_note = signal(initial_piano_settings.max_note);

	const to_piano_data = (): Piano_Settings => ({
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

	const pressed_keys = $derived($playing_notes);

	let clientWidth: number | undefined = $state();

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

<Midi_Input
	{midi_access}
	onnotestart={(e) => play(e.detail.note, e.detail.velocity)}
	onnotestop={(e) => stop_playing(e.detail.note)}
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
				onpress={(e) => play(e.detail)}
				onrelease={(e) => stop_playing(e.detail)}
			/>
		{/if}
	</div>
	<form class="width_sm panel p_md">
		<fieldset>
			<Instrument_Control {instrument} />
			<div class="row">
				<Select_Notes_Control {scale} {key} />
			</div>
			<Volume_Control {volume} />
		</fieldset>
		<fieldset>
			<Init_Midi_Button />
		</fieldset>
		<fieldset class="row">
			<Midi_Range_Control {min_note} {max_note} />
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
		padding: var(--space_md);
	}
</style>
