<script lang="ts">
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import {slide} from 'svelte/transition';
	import type {Signal} from '@preact/signals-core';

	import {midi_names, MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music.js';

	interface Props {
		min_note: Signal<Midi>;
		max_note: Signal<Midi>;
	}

	const {min_note, max_note}: Props = $props();

	const error_message = $derived(
		$min_note > $max_note ? 'note min cannot be larger than the max' : false,
	);

	// TODO remove and use `bind:` once Signals support it
	const input_min_note = (e: any) => (min_note.value = Number(e.currentTarget.value));
	const input_max_note = (e: any) => (max_note.value = Number(e.currentTarget.value));
</script>

<div class="midi-range-control" class:error={!!error_message}>
	<div class="box row">
		<label>
			<div class="title">lowest note</div>
			{midi_names[$min_note]}
			<input
				type="range"
				value={$min_note}
				oninput={input_min_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
			<input
				type="number"
				value={$min_note}
				oninput={input_min_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
		</label>
		<label>
			<div class="title">highest note</div>
			{midi_names[$max_note]}
			<input
				type="range"
				value={$max_note}
				oninput={input_max_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
			<input
				type="number"
				value={$max_note}
				oninput={input_max_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
		</label>
	</div>
	{#if error_message}
		<div transition:slide|local>
			<Alert status="error">{error_message}</Alert>
		</div>
	{/if}
</div>

<style>
	/* .midi-range-control {
	} */
</style>
