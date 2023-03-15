<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {midi_naturals} from '$lib/music/notes';
	import type {Midi} from '$lib/music/midi';

	const dispatch = createEventDispatcher<{press: Midi; release: Midi}>();

	export let midi: Midi;
	export let left_offset: number;
	export let width: number;
	export let height: number;
	export let clickable = true;
	export let enabled = true;
	export let highlighted = false;
	export let emphasized = false;

	$: white = midi_naturals.has(midi);
	$: black = !white;
</script>

<button
	class="piano-key"
	class:white
	class:black
	class:disabled={!enabled}
	class:clickable={clickable && enabled}
	class:highlighted
	class:emphasized
	on:mousedown={enabled ? () => dispatch('press', midi) : undefined}
	on:mouseup={enabled ? () => dispatch('release', midi) : undefined}
	on:mouseleave={enabled ? () => dispatch('release', midi) : undefined}
	aria-label="piano key for midi {midi}"
	style:width="{width}px"
	style:height="{height}px"
	style:left="{left_offset}px"
/>

<style>
	.piano-key {
		/* TODO move these */
		--white-key-color: #fff;
		--black-key-color: #333;
		--white-key-disabled-color: #999;
		--black-key-disabled-color: #777;
		--border-color: rgba(0, 0, 0, 0.22);
		--primary-color: #00bb00;
		--primary-color-dark: #007700;
		--highlighted-key-color: rgb(46, 114, 241);

		position: absolute;
		top: 0;
		border-left: 1px solid var(--border-color);
		border-top: 1px solid var(--border-color);
		border-bottom: 1px solid var(--border-color);
		border-radius: var(--border_radius_xs);
		padding: 0;
		min-height: 0;
	}

	.piano-key:last-child {
		border-right: 1px solid var(--border-color);
	}

	.clickable {
		transform-origin: top center;
	}
	.clickable:hover {
		background-color: var(--primary-color);
	}
	.clickable:active {
		background-color: var(--primary-color-dark);
	}

	.white {
		background-color: var(--white-key-color);
		z-index: 1;
	}
	.black {
		background-color: var(--black-key-color);
		z-index: 2;
	}

	.highlighted {
		background-color: var(--highlighted-key-color);
	}

	.disabled {
		cursor: default;
	}

	.white.disabled,
	.white.disabled:hover,
	.white.disabled:active {
		background-color: var(--white-key-disabled-color);
	}
	.black.disabled,
	.black.disabled:hover,
	.black.disabled:active {
		background-color: var(--black-key-disabled-color);
	}

	.emphasized::before {
		display: block;
		position: relative;
		left: 0;
		top: -30px;
		content: '';
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background-color: rgb(243, 211, 159);
	}
</style>
