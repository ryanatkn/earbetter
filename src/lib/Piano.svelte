<script lang="ts">
	import type {Snippet} from 'svelte';
	import type {SvelteSet} from 'svelte/reactivity';

	import Piano_Key from '$lib/Piano_Key.svelte';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music.js';
	import {compute_piano} from '$lib/piano.js';

	interface Props {
		width: number;
		max_height?: number | undefined;
		min_note?: Midi;
		max_note?: Midi;
		enabled_notes?: Set<Midi> | null;
		pressed_keys?: SvelteSet<Midi> | null;
		highlighted_keys?: Set<Midi> | null;
		emphasized_keys?: Set<Midi> | null;
		clickable?: boolean;
		/**
		 * Adds a label to the middle C key.
		 */
		middle_c_label?: string | boolean | Snippet;
		/**
		 * If focus exits a key while it's pressed without using the mouse,
		 * it will by default keep the key stuck down until a mouseleave event, which is kind of fun.
		 * Set to `false` to disable this quirky behavior.
		 */
		allow_sticking?: boolean;
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
		middle_c_label,
		allow_sticking,
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

	/**
	 * Used to allow dragging across the piano regardless of where the mousedown event occurred.
	 */
	let pressing_any = $state(false);
</script>

<svelte:window
	onmousedowncapture={() => (pressing_any = true)}
	onmouseupcapture={() => (pressing_any = false)}
	onmouseleave={() => (pressing_any = false)}
/>

<div
	class="piano"
	class:disabled={!clickable}
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
			{note}
			{left_offset}
			{clickable}
			enabled={!enabled_notes || enabled_notes.has(note)}
			pressed={pressed_keys?.has(note)}
			highlighted={highlighted_keys?.has(note)}
			emphasized={emphasized_keys?.has(note)}
			{middle_c_label}
			{allow_sticking}
			{pressing_any}
			{onpress}
			{onrelease}
		/>
	{/each}
</div>

<style>
	.piano {
		position: relative;
	}
	.disabled {
		pointer-events: none;
	}
</style>
