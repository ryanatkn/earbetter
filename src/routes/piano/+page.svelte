<script lang="ts">
	import Piano from '$lib/music/Piano.svelte';
	import {setAudioCtx, getAudioCtx} from '$lib/audio/audioCtx';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import type {Midi} from '$lib/music/midi';
	import {playNote} from '$lib/audio/playNote';

	// TODO BLOCK set in root layout?
	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
	const audioCtx = getAudioCtx();

	let midi_input: MidiInput;

	let clientWidth: number; // `undefined` on first render

	// emphasize middle C to make it easier to orient oneself on a MIDI keyboard
	const emphasized_keys = new Set([60 as Midi]);

	// TODO BLOCK instead of duration do up/down
	const DURATION = 1000;

	const onPressKey = (midi: Midi): void => {
		console.log('press midi key', midi);
		void playNote(audioCtx, midi, DURATION);
	};
</script>

<main bind:clientWidth>
	<MidiInput
		bind:this={midi_input}
		on:note_start={(e) => {
			console.log(`midi`, e.detail);
			void playNote(audioCtx, e.detail.note, DURATION);
		}}
	/>
	<div class="piano-wrapper">
		{#if clientWidth}
			<Piano
				width={clientWidth}
				midi_min={48}
				midi_max={96}
				on:press={(e) => onPressKey(e.detail)}
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
