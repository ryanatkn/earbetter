<script lang="ts">
	import PianoKey from '$lib/music/PianoKey.svelte';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music/music';
	import {compute_piano} from '$lib/music/piano';

	export let width: number;
	export let note_min: Midi = MIDI_MIN;
	export let note_max: Midi = MIDI_MAX;
	export let enabled_notes: Set<Midi> | null = null;
	export let pressed_keys: Set<Midi> | null = null;
	export let highlighted_keys: Set<Midi> | null = null;
	export let emphasized_keys: Set<Midi> | null = null;

	$: ({
		piano_keys,
		natural_key_width,
		natural_key_height,
		accidental_key_width,
		accidental_key_height,
	} = compute_piano(width, note_min, note_max));
</script>

<div
	class="piano"
	style:width="{width}px"
	style:--piano_natural_key_width="{natural_key_width}px"
	style:--piano_natural_key_height="{natural_key_height}px"
	style:--piano_accidental_key_width="{accidental_key_width}px"
	style:--piano_accidental_key_height="{accidental_key_height}px"
>
	<div class="piano-keys">
		{#each piano_keys as { midi, left_offset } (midi)}
			<PianoKey
				on:press
				on:release
				{midi}
				{left_offset}
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
