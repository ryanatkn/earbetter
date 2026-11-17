<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Piano from '#lib/Piano.svelte';
	import MidiInput from '#lib/MidiInput.svelte';
	import InitMidiButton from '#lib/InitMidiButton.svelte';
	import VolumeControl from '#lib/VolumeControl.svelte';
	import Header from '#routes/Header.svelte';
	import Footer from '#routes/Footer.svelte';
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

	// saves on write through the function bindings below, no effect watches the state
	const save_piano_data = (): void => {
		const data: PianoSettings = { min_note, max_note };
		set_in_storage(SITE_DATA_STORAGE_KEY, data);
	};

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		if (!app.enabled_notes || app.enabled_notes.has(note)) {
			app.start_note(note, velocity);
		}
	};
</script>

<svelte:head>
	<title>Earbetter: piano</title>
</svelte:head>

<MidiInput inputs={app.midi_inputs} onnotestart={play} onnotestop={app.stop_note} />
<main>
	<BackButton onclick={() => goto(resolve('/'))} />
	<Header />
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		<Piano
			{min_note}
			{max_note}
			pressed_keys={app.playing_notes}
			enabled_notes={app.enabled_notes}
			onpress={(note) => play(note)}
			onrelease={app.stop_note}
			middle_c_label
			allow_sticking
		/>
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
			<MidiRangeControl
				bind:min_note={
					() => min_note,
					(v) => {
						min_note = v;
						save_piano_data();
					}
				}
				bind:max_note={
					() => max_note,
					(v) => {
						max_note = v;
						save_piano_data();
					}
				}
			/>
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
		width: 100%; /* the self-measuring piano fills this, so it can't shrink to fit */
		padding: var(--space_md);
	}
</style>
