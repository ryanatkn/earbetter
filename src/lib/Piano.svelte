<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SvelteSet } from 'svelte/reactivity';

	import PianoKey from './PianoKey.svelte';
	import { MIDI_MIN, MIDI_MAX, type Midi } from './music.ts';
	import { compute_piano } from './piano.ts';

	/**
	 * Fills the width of its container, measuring itself, and sizes its keys to fit.
	 */
	interface Props {
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
		max_height,
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
		onrelease
	}: Props = $props();

	let width: number | undefined = $state();

	const piano = $derived(width ? compute_piano(width, min_note, max_note, max_height) : null);

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

<div class="sizer" bind:clientWidth={width}>
	{#if piano}
		<div
			class="piano"
			class:disabled={!clickable}
			aria-disabled={!clickable}
			style:width="{width}px"
			style:height="{piano.natural_key_height}px"
			style:--piano_natural_key_width="{piano.natural_key_width}px"
			style:--piano_natural_key_height="{piano.natural_key_height}px"
			style:--piano_accidental_key_width="{piano.accidental_key_width}px"
			style:--piano_accidental_key_height="{piano.accidental_key_height}px"
		>
			{#each piano.piano_keys as { note, left_offset } (note)}
				<PianoKey
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
	{/if}
</div>

<style>
	.sizer {
		width: 100%;
	}
	.piano {
		position: relative;
	}
	.disabled {
		pointer-events: none;
	}
</style>
