<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {swallow} from '@ryanatkn/belt/dom.js';

	import {type Midi, midi_naturals} from '$lib/music';
	import {find_next_sibling, find_previous_sibling} from '$lib/dom';

	const dispatch = createEventDispatcher<{press: Midi; release: Midi}>();

	export let midi: Midi;
	export let left_offset: number;
	export let clickable = true;
	export let enabled = true;
	export let pressed = false;
	export let pressing = false; // piano-wide state to enable dragging with the pointer
	export let highlighted = false;
	export let emphasized = false;
	export let show_middle_c = true;

	$: natural = midi_naturals.has(midi);
	$: accidental = !natural;
	$: middle_c = midi === 60;

	const focus_previous_button = (node: ChildNode): void => {
		const s = find_previous_sibling<HTMLButtonElement>(node, (n) => n instanceof HTMLButtonElement);
		s?.focus();
	};
	const focus_next_button = (node: ChildNode): void => {
		const s = find_next_sibling<HTMLButtonElement>(node, (n) => n instanceof HTMLButtonElement);
		s?.focus();
	};

	const keydown = (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		},
	): void => {
		const {key} = e;
		switch (key) {
			case ' ':
			case 'Enter': {
				swallow(e);
				dispatch('press', midi);
				e.currentTarget.focus();
				break;
			}
			case 'ArrowLeft': {
				focus_previous_button(e.currentTarget);
				break;
			}
			case 'ArrowRight': {
				focus_next_button(e.currentTarget);
				break;
			}
		}
	};
	const keyup = (
		e: KeyboardEvent & {
			currentTarget: EventTarget & HTMLButtonElement;
		},
	): void => {
		const {key} = e;
		switch (key) {
			case ' ':
			case 'Enter': {
				swallow(e);
				dispatch('release', midi);
				break;
			}
		}
	};

	$: clickable_and_enabled = clickable && enabled;
</script>

<button
	type="button"
	class="piano-key"
	class:natural
	class:accidental
	class:disabled={!enabled}
	class:clickable={clickable_and_enabled}
	class:active={pressed}
	class:highlighted
	class:emphasized
	tabindex={clickable_and_enabled ? undefined : -1}
	on:keydown={clickable_and_enabled ? keydown : undefined}
	on:keyup={clickable_and_enabled ? keyup : undefined}
	on:mousedown={clickable_and_enabled
		? (e) => {
				swallow(e);
				dispatch('press', midi);
				pressing = true;
				e.currentTarget.focus();
			}
		: undefined}
	on:mouseup={clickable_and_enabled
		? (e) => {
				swallow(e);
				dispatch('release', midi);
				pressing = false;
			}
		: undefined}
	on:mouseenter={clickable_and_enabled && pressing
		? (e) => {
				swallow(e);
				dispatch('press', midi);
				e.currentTarget.focus();
			}
		: undefined}
	on:mouseleave={clickable_and_enabled
		? (e) => {
				swallow(e);
				dispatch('release', midi);
			}
		: undefined}
	aria-label="piano key for midi {midi}"
	data-note={midi}
	style:left="{left_offset}px"
>
	{#if middle_c && show_middle_c}
		<span class="middle-c">C4</span>
	{/if}
</button>

<style>
	.piano-key {
		/* custom */
		--natural_width: var(--piano_natural_key_width, 60px);
		--natural_height: var(--piano_natural_key_height, 175px);
		--accidental_width: var(--piano_accidental_key_width, 35px);
		--accidental_height: var(--piano_accidental_key_height, 122px);
		--border_color: var(--piano_border_color, rgba(0, 0, 0, 0.22));
		/* TODO scale to `piano_key_width` */
		--emphasized_marker_width: 20px;
		--z_index_offset: 0;

		position: absolute;
		top: 0;
		border-radius: var(--radius_xs);
		padding: 0;
		min-height: 0;
		z-index: var(--z_index_offset);
		cursor: default;
	}

	.piano-key:focus {
		--z_index_offset: 1;
		outline-width: var(--border_width_4);
	}
	.piano-key:focus {
		outline-width: var(--border_width_3);
	}

	.piano-key:last-child {
		border-right: 1px solid var(--border_color);
	}

	.clickable {
		transform-origin: top center;
		cursor: pointer;
	}
	.clickable:hover {
		background-color: var(--primary_color, #00bb00);
	}

	.natural {
		width: var(--natural_width);
		height: var(--natural_height);
		background-color: var(--piano_natural_key_color, #fff);
	}
	.accidental {
		width: var(--accidental_width);
		height: var(--accidental_height);
		background-color: var(--piano_accidental_key_color, #333);
		z-index: calc(2 + var(--z_index_offset));
	}

	.highlighted {
		background-color: var(--highlighted_key_color, var(--accent_color, #2e72f1));
		animation: var(--highlighted_animation) 1s ease infinite alternate;
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

	/* this is order-sensitive, makes the MIDI input override any disabled state */
	.clickable:active,
	.piano-key.active {
		background-color: var(--primary_color_dark, #007700);
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
		user-select: none;
	}
</style>
