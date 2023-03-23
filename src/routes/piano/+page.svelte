<script lang="ts">
	import Piano from '$lib/music/Piano.svelte';
	import {get_ac} from '$lib/audio/ac';
	import {midi_access} from '$lib/audio/midi_access';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';
	import {playing_notes, start_playing, stop_playing} from '$lib/audio/play_note';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_instrument, get_volume} from '$lib/audio/helpers';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';

	const ac = get_ac();
	const volume = get_volume();
	const instrument = get_instrument();

	$: pressed_keys = $playing_notes;

	let clientWidth: number; // `undefined` on first render

	let note_min: Midi = 36;
	let note_max: Midi = 96;

	const piano_padding = 20;
</script>

<svelte:head>
	<title>earbetter: piano</title>
</svelte:head>

<MidiInput
	{midi_access}
	on:note_start={(e) => start_playing(ac, e.detail.note, $volume, $instrument)}
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
				on:press={(e) => start_playing(ac, e.detail, $volume, $instrument)}
				on:release={(e) => stop_playing(e.detail)}
			/>
		{/if}
	</div>
	<form class="column-sm markup">
		<fieldset class="row">
			<label>
				MIDI min
				<input type="number" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
			<label>
				MIDI max
				<input type="number" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
		</fieldset>
		<fieldset>
			<VolumeControl {volume} />
			<InstrumentControl {instrument} />
		</fieldset>
		<fieldset>
			<InitMidiButton {midi_access} />
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
