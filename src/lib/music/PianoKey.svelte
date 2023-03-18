<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {midi_naturals} from '$lib/music/notes';
	import type {Midi} from '$lib/music/midi';

	const dispatch = createEventDispatcher<{press: Midi; release: Midi}>();

	export let midi: Midi;
	export let left_offset: number;
	export let clickable = true;
	export let enabled = true;
	export let highlighted = false;
	export let emphasized = false;
	export let show_middle_c = true;

	$: natural = midi_naturals.has(midi);
	$: accidental = !natural;
	$: middle_c = midi === 60;
</script>

<button
	type="button"
	class="piano-key"
	class:natural
	class:accidental
	class:disabled={!enabled}
	class:clickable={clickable && enabled}
	class:highlighted
	class:emphasized
	on:mousedown={enabled ? () => dispatch('press', midi) : undefined}
	on:mouseup={enabled ? () => dispatch('release', midi) : undefined}
	on:mouseleave={enabled ? () => dispatch('release', midi) : undefined}
	aria-label="piano key for midi {midi}"
	style:left="{left_offset}px"
>
	{#if middle_c && show_middle_c}
		<span class="middle-c">C4</span>
	{/if}
</button>

<style>
	.piano-key {
		--natural_width: var(--piano_natural_key_width, 60px);
		--natural_height: var(--piano_natural_key_height, 175px);
		--accidental_width: var(--piano_accidental_key_width, 35px);
		--accidental_height: var(--piano_accidental_key_height, 122px);
		--border_color: var(--piano_border_color, rgba(0, 0, 0, 0.22));
		/* TODO scale to `piano_key_width` */
		--emphasized_marker_width: 20px;

		position: absolute;
		top: 0;
		border-radius: var(--border_radius_xs);
		padding: 0;
		min-height: 0;
	}

	.piano-key:last-child {
		border-right: 1px solid var(--border_color);
	}

	.clickable {
		transform-origin: top center;
	}
	.clickable:hover {
		background-color: var(--primary_color, #00bb00);
	}
	.clickable:active {
		background-color: var(--primary_color_dark, #007700);
	}

	.natural {
		width: var(--natural_width);
		height: var(--natural_height);
		background-color: var(--piano_natural_key_color, #fff);
		z-index: 1;
	}
	.accidental {
		width: var(--accidental_width);
		height: var(--accidental_height);
		background-color: var(--piano_accidental_key_color, #333);
		z-index: 2;
	}

	.highlighted {
		background-color: var(--highlighted_key_color, var(--accent_color, #2e72f1));
	}

	.disabled {
		cursor: default;
	}

	.natural.disabled,
	.natural.disabled:hover,
	.natural.disabled:active {
		background-color: var(--natural_key_disabled_color, #999);
	}
	.accidental.disabled,
	.accidental.disabled:hover,
	.accidental.disabled:active {
		background-color: var(--accidental_key_disabled_color, #777);
	}

	.emphasized::before {
		display: block;
		position: absolute;
		left: calc(50% - var(--emphasized_marker_width) / 2);
		bottom: calc(var(--emphasized_marker_width) / 2);
		content: '';
		width: var(--emphasized_marker_width);
		height: var(--emphasized_marker_width);
		border-radius: 50%;
		background-color: rgb(243, 211, 159);
	}

	.middle-c {
		color: var(--text_color_dark);
		text-shadow: var(--text_shadow);
		position: absolute;
		left: calc(50% - var(--emphasized_marker_width) / 2);
		bottom: calc(var(--emphasized_marker_width) / 2);
		width: var(--emphasized_marker_width);
		height: var(--emphasized_marker_width);
	}
</style>
