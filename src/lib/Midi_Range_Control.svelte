<script lang="ts">
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import {slide} from 'svelte/transition';

	import {midi_names, MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music.js';

	interface Props {
		min_note: Midi;
		max_note: Midi;
	}

	let {min_note = $bindable(), max_note = $bindable()}: Props = $props();

	const error_message = $derived(
		min_note > max_note ? 'note min cannot be larger than the max' : false,
	);
</script>

<div class="midi-range-control" class:error={!!error_message}>
	<div class="box row">
		<label class="text_align_center">
			<div class="title">lowest note</div>
			<div>{midi_names[min_note]}</div>
			<input type="range" bind:value={min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			<input type="number" bind:value={min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
		</label>
		<label class="text_align_center">
			<div class="title">highest note</div>
			<div>{midi_names[max_note]}</div>
			<input type="range" bind:value={max_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			<input type="number" bind:value={max_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
		</label>
	</div>
	{#if error_message}
		<div transition:slide>
			<Alert status="error">{error_message}</Alert>
		</div>
	{/if}
</div>

<style>
	/* .midi-range-control {
	} */
</style>
