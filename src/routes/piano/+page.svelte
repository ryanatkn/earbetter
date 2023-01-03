<script lang="ts">
	import Piano from '$lib/music/Piano.svelte';
	import {setAudioCtx, getAudioCtx} from '$lib/audio/audioCtx';
	import {getMidiInput} from '$lib/audio/midiInput';
	import type {Midi} from '$lib/music/midi';
	import {playNote} from '$lib/audio/playNote';

	// TODO BLOCK set in root layout?
	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
	const audioCtx = getAudioCtx();

	let clientWidth: number; // `undefined` on first render

	// emphasize middle C to make it easier to orient oneself on a MIDI keyboard
	const emphasizedKeys = new Set([60 as Midi]);

	// TODO BLOCK instead of duration do up/down
	const DURATION = 1000;

	getMidiInput({
		onNoteStart: (midi) => {
			void playNote(audioCtx, midi, DURATION);
		},
	});

	const onPressKey = (midi: Midi): void => {
		console.log('press midi key', midi);
		void playNote(audioCtx, midi, DURATION);
	};
</script>

<main bind:clientWidth>
	<div class="piano-wrapper">
		{#if clientWidth}
			<Piano
				width={clientWidth}
				midiMin={48}
				midiMax={96}
				on:press={(e) => onPressKey(e.detail)}
				{emphasizedKeys}
			/>
		{/if}
	</div>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
	}
</style>
