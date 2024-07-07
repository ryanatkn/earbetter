<script lang="ts">
	import {z} from 'zod';
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Piano from '$lib/Piano.svelte';
	import {get_audio_context} from '$lib/audio_context.js';
	import Midi_Input from '$lib/Midi_Input.svelte';
	import {start_playing, stop_playing} from '$lib/play_note.js';
	import Init_Midi_Button from '$lib/Init_Midi_Button.svelte';
	import Volume_Control from '$lib/Volume_Control.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {with_velocity} from '$lib/audio_helpers.js';
	import Instrument_Control from '$lib/Instrument_Control.svelte';
	import Midi_Range_Control from '$lib/Midi_Range_Control.svelte';
	import {Midi} from '$lib/music.js';
	import Select_Notes_Control from '$lib/Select_Notes_Control.svelte';
	import {load_from_storage, set_in_storage} from '$lib/storage.js';
	import Back_Button from '$routes/Back_Button.svelte';
	import {get_app} from '$lib/earbetter/app.js';

	const app = get_app();

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

	const min_note = $state(initial_piano_settings.min_note);
	const max_note = $state(initial_piano_settings.max_note);

	const to_piano_data = (): Piano_Settings => ({min_note, max_note});
	const save_piano_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_piano_data());
	$effect(save_piano_data);

	const ac = get_audio_context();

	const pressed_keys = $derived(app.playing_notes);

	let clientWidth: number | undefined = $state();

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		if (!app.enabled_notes || app.enabled_notes.has(note)) {
			start_playing(app, ac(), note, with_velocity(app.volume, velocity), app.instrument);
		}
	};
</script>

<svelte:head>
	<title>Earbetter: piano</title>
</svelte:head>

<Midi_Input
	midi_access={app.midi_access}
	onnotestart={(note, velocity) => play(note, velocity)}
	onnotestop={(note) => stop_playing(note)}
/>
<main bind:clientWidth>
	<Back_Button onclick={() => goto(base + '/')} />
	<Header />
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				{min_note}
				{max_note}
				{pressed_keys}
				enabled_notes={app.enabled_notes}
				onpress={(note) => play(note)}
				onrelease={(note) => stop_playing(note)}
				middle_c_label
				allow_sticking
			/>
		{/if}
	</div>
	<form class="width_sm panel p_md">
		<fieldset>
			<Instrument_Control instrument={app.instrument} />
			<div class="row">
				<Select_Notes_Control scale={app.scale} key={app.key} />
			</div>
			<Volume_Control bind:volume={app.volume} />
		</fieldset>
		<fieldset>
			<Init_Midi_Button midi_state={app} />
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
	.piano_wrapper {
		padding: var(--space_md);
	}
</style>
