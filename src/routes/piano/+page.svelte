<script lang="ts">
	import Piano from '$lib/music/Piano.svelte';
	import {get_ac} from '$lib/audio/ac';
	import {midi_access} from '$lib/audio/midi_access';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import {playing_notes, start_playing, stop_playing} from '$lib/audio/play_note';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/audio/helpers';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';
	import MidiRangeControl from '$lib/audio/MidiRangeControl.svelte';
	import {get_scale, get_key, get_enabled_notes, Midi} from '$lib/music/music';
	import SelectNotesControl from '$lib/music/SelectNotesControl.svelte';

	const ac = get_ac();
	const volume = get_volume();
	const instrument = get_instrument();
	const scale = get_scale();
	const key = get_key();
	const enabled_notes = get_enabled_notes();

	$: pressed_keys = $playing_notes;

	let clientWidth: number; // `undefined` on first render

	let note_min: Midi = 36;
	let note_max: Midi = 96;

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		if (!$enabled_notes || $enabled_notes.has(note)) {
			start_playing(ac, note, with_velocity($volume, velocity), $instrument);
		}
	};

	// TODO save settings
	// export const PianoSettings = z.object({
	//   note_min: Midi
	// })
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
				{note_min}
				{note_max}
				{pressed_keys}
				enabled_notes={$enabled_notes}
				on:press={(e) => play(e.detail)}
				on:release={(e) => stop_playing(e.detail)}
			/>
		{/if}
	</div>
	<form class="column-sm markup panel padded-md">
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
			<MidiRangeControl bind:note_min bind:note_max />
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
