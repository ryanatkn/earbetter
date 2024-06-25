<script lang="ts">
	import {Set} from 'svelte/reactivity';

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
		onpress?: (note: Midi) => void;
		onrelease?: (note: Midi) => void;
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

	const pressing: Set<Midi> = new Set(); // TODO BLOCK need to unify with `pressed_keys` and fix the bug where click isn't needed

	const drag_to_press = $derived(pressing.size > 0);
	$inspect('drag_to_press', drag_to_press);

	// TODO better naming convention than `*_local`?
	const onpress_local = (note: Midi): void => {
		pressing.add(note);
		onpress?.(note);
	};
	const onrelease_local = (note: Midi): void => {
		pressing.delete(note);
		onrelease?.(note);
	};
	const onleave = (note: Midi, pressed: boolean): void => {
		if (!pressed) return;
		onrelease?.(note);
	};
</script>

<div
	class="piano"
	aria-disabled={!clickable}
	style:width="{width}px"
	style:height="{natural_key_height}px"
	style:--piano_natural_key_width="{natural_key_width}px"
	style:--piano_natural_key_height="{natural_key_height}px"
	style:--piano_accidental_key_width="{accidental_key_width}px"
	style:--piano_accidental_key_height="{accidental_key_height}px"
>
	{#each piano_keys as { note, left_offset } (note)}
		<Piano_Key
			onpress={onpress_local}
			onrelease={onrelease_local}
			{onleave}
			{note}
			{left_offset}
			{clickable}
			enabled={!enabled_notes || enabled_notes.has(note)}
			pressed={pressed_keys?.has(note)}
			highlighted={highlighted_keys?.has(note)}
			emphasized={emphasized_keys?.has(note)}
			{drag_to_press}
		/>
	{/each}
</div>

<style>
	.piano {
		position: relative;
	}
</style>
