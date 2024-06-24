<script lang="ts">
	import Piano_Key from '$lib/Piano_Key.svelte';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music.js';
	import {compute_piano} from '$lib/piano.js';

	interface Props {
		width: number;
		max_height?: number | undefined;
		min_note?: Midi;
		max_note?: Midi;
		enabled_notes?: Set<Midi> | null;
		pressed_keys?: Set<Midi> | null;
		highlighted_keys?: Set<Midi> | null;
		emphasized_keys?: Set<Midi> | null;
		clickable?: boolean;
		onpress?: (midi: Midi) => void;
		onrelease?: (midi: Midi) => void;
	}

	const {
		width,
		max_height = undefined,
		min_note = MIDI_MIN,
		max_note = MIDI_MAX,
		enabled_notes = null,
		pressed_keys = null,
		highlighted_keys = null,
		emphasized_keys = null,
		clickable = true,
		onpress,
		onrelease,
	}: Props = $props();

	const {
		piano_keys,
		natural_key_width,
		natural_key_height,
		accidental_key_width,
		accidental_key_height,
	} = $derived(compute_piano(width, min_note, max_note, max_height));

	let pressing = $state(false); // piano-wide state to enable dragging with the pointer
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
			<Piano_Key
				{onpress}
				{onrelease}
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
