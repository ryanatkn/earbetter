<script lang="ts">
	import PianoKey from '$lib/PianoKey.svelte';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music.js';
	import {compute_piano} from '$lib/piano.js';

	export let width: number;
	export let max_height: number | undefined = undefined;
	export let min_note: Midi = MIDI_MIN;
	export let max_note: Midi = MIDI_MAX;
	export let enabled_notes: Set<Midi> | null = null;
	export let pressed_keys: Set<Midi> | null = null;
	export let highlighted_keys: Set<Midi> | null = null;
	export let emphasized_keys: Set<Midi> | null = null;
	export let clickable = true;

	$: ({
		piano_keys,
		natural_key_width,
		natural_key_height,
		accidental_key_width,
		accidental_key_height,
	} = compute_piano(width, min_note, max_note, max_height));

	let pressing = false; // piano-wide state to enable dragging with the pointer
</script>

<div
	class="piano"
	aria-disabled={!clickable}
	style:width="{width}px"
	style:--piano_natural_key_width="{natural_key_width}px"
	style:--piano_natural_key_height="{natural_key_height}px"
	style:--piano_accidental_key_width="{accidental_key_width}px"
	style:--piano_accidental_key_height="{accidental_key_height}px"
>
	<div class="piano-keys">
		{#each piano_keys as { midi, left_offset } (midi)}
			<PianoKey
				onpress
				onrelease
				{midi}
				{left_offset}
				bind:pressing
				{clickable}
				enabled={!enabled_notes || enabled_notes.has(midi)}
				pressed={pressed_keys?.has(midi)}
				highlighted={highlighted_keys?.has(midi)}
				emphasized={emphasized_keys?.has(midi)}
			/>
		{/each}
	</div>
</div>

<style>
	.piano {
		position: relative;
	}
	.piano-keys {
		height: var(--piano_natural_key_height);
	}
</style>
