<script lang="ts">
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';

	import Piano from '$lib/music/Piano.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';
	import {start_playing, stop_playing} from '$lib/audio/play_note';
	import InitMidiButton from '$lib/music/InitMidiButton.svelte';

	const audio_ctx = get_audio_ctx();

	let midi_input: MidiInput | undefined;

	let clientWidth: number; // `undefined` on first render

	// emphasize middle C to make it easier to orient oneself on a MIDI keyboard
	const emphasized_keys = new Set([60 as Midi]);

	let midi_min: Midi = 36;
	let midi_max: Midi = 96;

	const piano_padding = 20;
</script>

<main bind:clientWidth>
	<MidiInput
		bind:this={midi_input}
		on:note_start={(e) => start_playing(audio_ctx, e.detail.note)}
		on:note_stop={(e) => stop_playing(e.detail.note)}
	/>
	<div class="piano-wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				{midi_min}
				{midi_max}
				on:press={(e) => start_playing(audio_ctx, e.detail)}
				on:release={(e) => stop_playing(e.detail)}
				{emphasized_keys}
			/>
		{/if}
	</div>
	<form class="column-sm">
		<fieldset class="row">
			<label>
				MIDI min
				<input type="number" bind:value={midi_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={midi_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
			<label>
				MIDI max
				<input type="number" bind:value={midi_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={midi_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
		</fieldset>
		<InitMidiButton {midi_input} />
	</form>
	<Breadcrumbs basePath="" />
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
