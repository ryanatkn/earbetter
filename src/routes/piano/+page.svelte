<script lang="ts">
	import Piano from '$lib/music/Piano.svelte';
	import {set_audio_ctx, get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import type {Midi} from '$lib/music/midi';
	import {start_playing_note, type StopPlaying} from '$lib/audio/play_note';

	// TODO BLOCK set in root layout?
	set_audio_ctx(); // allows components to do `const audio_ctx = useAudio_ctx();` which uses svelte's `getContext`
	const audio_ctx = get_audio_ctx();

	let midi_input: MidiInput;

	let clientWidth: number; // `undefined` on first render

	// emphasize middle C to make it easier to orient oneself on a MIDI keyboard
	const emphasized_keys = new Set([60 as Midi]);

	// TODO allow playing notes at different volumes using velocity
	const playing: Map<Midi, StopPlaying> = new Map();
	const start_playing = (note: Midi): void => {
		const current = playing.get(note);
		if (current) return;
		playing.set(note, start_playing_note(audio_ctx, note));
	};
	const stop_playing = (note: Midi) => {
		const stop_playing_note = playing.get(note);
		if (!stop_playing_note) return;
		stop_playing_note?.();
		playing.delete(note);
	};
</script>

<main bind:clientWidth>
	<MidiInput
		bind:this={midi_input}
		on:note_start={(e) => start_playing(e.detail.note)}
		on:note_stop={(e) => stop_playing(e.detail.note)}
	/>
	<div class="piano-wrapper">
		{#if clientWidth}
			<Piano
				width={clientWidth}
				midi_min={48}
				midi_max={96}
				on:press={(e) => start_playing(e.detail)}
				on:release={(e) => stop_playing(e.detail)}
				{emphasized_keys}
			/>
		{/if}
	</div>
	<button on:click={() => void midi_input.init()}>init MIDI</button>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
	}
</style>
