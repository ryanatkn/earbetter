<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Piano from '#lib/Piano.svelte';
	import { audio_context_context } from '#lib/audio_context.ts';
	import MidiInput from '#lib/MidiInput.svelte';
	import { start_playing, stop_playing } from '#lib/play_note.ts';
	import InitMidiButton from '#lib/InitMidiButton.svelte';
	import VolumeControl from '#lib/VolumeControl.svelte';
	import Header from '#routes/Header.svelte';
	import Footer from '#routes/Footer.svelte';
	import { with_velocity } from '#lib/audio_helpers.ts';
	import InstrumentControl from '#lib/InstrumentControl.svelte';
	import MidiRangeControl from '#lib/MidiRangeControl.svelte';
	import { Midi } from '#lib/music.ts';
	import SelectNotesControl from '#lib/SelectNotesControl.svelte';
	import { load_from_storage, set_in_storage } from '#lib/storage.ts';
	import BackButton from '#routes/BackButton.svelte';
	import { app_context } from '#lib/earbetter/app.svelte.ts';

	const app = app_context.get();

	// TODO extract? is pretty specific - and Svelte is erroring without the `_Schema`
	// strips unknown keys because it's persisted across versions
	const PianoSettingsSchema = s.strip_object({
		min_note: s.with_default(Midi, 36),
		max_note: s.with_default(Midi, 96)
	});
	type PianoSettings = s.Infer<typeof PianoSettingsSchema>;
	const SITE_DATA_STORAGE_KEY = 'piano';
	const initial_piano_settings = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => s.parse_or_throw(PianoSettingsSchema, {}),
		(v) => s.parse_or_throw(PianoSettingsSchema, v)
	);

	let min_note = $state(initial_piano_settings.min_note);
	let max_note = $state(initial_piano_settings.max_note);

	const to_piano_data = (): PianoSettings => ({ min_note, max_note });
	const save_piano_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_piano_data());
	$effect(save_piano_data);

	const ac = audio_context_context.get();

	const { playing_notes } = app;

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

<MidiInput
	midi_access={app.midi_access}
	onnotestart={(note, velocity) => play(note, velocity)}
	onnotestop={(note) => stop_playing(note)}
/>
<main bind:clientWidth>
	<BackButton onclick={() => goto(resolve('/'))} />
	<Header />
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				{min_note}
				{max_note}
				pressed_keys={playing_notes}
				enabled_notes={app.enabled_notes}
				onpress={(note) => play(note)}
				onrelease={(note) => stop_playing(note)}
				middle_c_label
				allow_sticking
			/>
		{/if}
	</div>
	<form class="width_atmost_sm panel p_md">
		<fieldset>
			<InstrumentControl bind:instrument={app.instrument} />
			<div class="row mb_lg">
				<SelectNotesControl bind:scale={app.scale} bind:key={app.key} />
			</div>
			<VolumeControl bind:volume={app.volume} />
		</fieldset>
		<fieldset>
			<InitMidiButton midi_state={app} />
		</fieldset>
		<fieldset class="row">
			<MidiRangeControl bind:min_note bind:max_note />
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
