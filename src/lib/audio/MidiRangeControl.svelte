<script lang="ts">
	import Message from '@feltjs/felt-ui/Message.svelte';
	import {slide} from 'svelte/transition';

	import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';
	import {midi_names} from '$lib/music/notes';

	export let note_min: Midi;
	export let note_max: Midi;

	$: error_message = note_min > note_max ? 'note min cannot be larger than the max' : false;
	// TODO add error state to Felt controls (maybe `.error`?)
</script>

<div class="midi-range-control" class:error={!!error_message}>
	<div class="centered-hz">
		<label>
			<div class="title">lowest MIDI key</div>
			<input type="number" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			{midi_names[note_min]}
			<input type="range" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
		</label>
		<label>
			<div class="title">highest MIDI key</div>
			<input type="number" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			{midi_names[note_max]}
			<input type="range" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
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
