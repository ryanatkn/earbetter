<script lang="ts">
	import type MidiInput from '$lib/audio/MidiInput.svelte';

	export let midi_input: MidiInput | undefined;

	$: midi_access = midi_input?.midi_access;
</script>

<button
	class="big w-full"
	on:click={() => void midi_input?.init()}
	disabled={!midi_input || !!$midi_access}
	title={midi_input ? ($midi_access ? 'MIDI is ready!' : 'connect your MIDI device') : 'loading...'}
>
	init MIDI
</button>
