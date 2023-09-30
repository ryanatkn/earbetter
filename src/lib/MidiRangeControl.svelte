<script lang="ts">
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import {slide} from 'svelte/transition';
	import type {Signal} from '@preact/signals-core';

	import {midi_names, MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music';

	export let min_note: Signal<Midi>;
	export let max_note: Signal<Midi>;

	$: error_message = $min_note > $max_note ? 'note min cannot be larger than the max' : false;
	// TODO add error state to Felt controls (maybe `.error`?)

	// TODO remove and use `bind:` once Signals support it
	const input_min_note = (e: any) => (min_note.value = Number(e.currentTarget.value));
	const input_max_note = (e: any) => (max_note.value = Number(e.currentTarget.value));
</script>

<div class="midi-range-control" class:error={!!error_message}>
	<div class="centered-hz">
		<label>
			<div class="title">lowest MIDI key</div>
			{midi_names[$min_note]}
			<input
				type="range"
				value={$min_note}
				on:input={input_min_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
			<input
				type="number"
				value={$min_note}
				on:input={input_min_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
		</label>
		<label>
			<div class="title">highest MIDI key</div>
			{midi_names[$max_note]}
			<input
				type="range"
				value={$max_note}
				on:input={input_max_note}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
			<input
				type="number"
				value={$max_note}
				on:input={input_max_note}
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
