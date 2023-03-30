<script lang="ts">
	import Message from '@feltjs/felt-ui/Message.svelte';
	import {slide} from 'svelte/transition';
	import type {Signal} from '@preact/signals-core';

	import {midi_names, MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/music';

	export let note_min: Signal<Midi>;
	export let note_max: Signal<Midi>;

	$: error_message = $note_min > $note_max ? 'note min cannot be larger than the max' : false;
	// TODO add error state to Felt controls (maybe `.error`?)

	// TODO remove and use `bind:` once Signals support it
	const input_note_min = (e: any) => (note_min.value = Number(e.currentTarget.value));
	const input_note_max = (e: any) => (note_max.value = Number(e.currentTarget.value));
</script>

<div class="midi-range-control" class:error={!!error_message}>
	<div class="centered-hz">
		<label>
			<div class="title">lowest MIDI key</div>
			<input
				type="number"
				value={$note_min}
				on:input={input_note_min}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
			{midi_names[$note_min]}
			<input
				type="range"
				value={$note_min}
				on:input={input_note_min}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
		</label>
		<label>
			<div class="title">highest MIDI key</div>
			<input
				type="number"
				value={$note_max}
				on:input={input_note_max}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
			{midi_names[$note_max]}
			<input
				type="range"
				value={$note_max}
				on:input={input_note_max}
				step={1}
				min={MIDI_MIN}
				max={MIDI_MAX}
			/>
		</label>
	</div>
	{#if error_message}
		<div transition:slide|local>
			<Message status="error">{error_message}</Message>
		</div>
	{/if}
</div>

<style>
	/* .midi-range-control {
	} */
</style>
