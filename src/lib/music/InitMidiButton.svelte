<script lang="ts">
	import type MidiInput from '$lib/audio/MidiInput.svelte';

	export let midi_input: MidiInput | undefined;

	// TODO move MIDI initialization to some other action, like the button to start a level

	$: midi_access = midi_input?.midi_access;
	$: disabled = !midi_input || !!$midi_access;

	$: midi_inputs = $midi_access && Array.from($midi_access.inputs.values());
</script>

<button
	type="button"
	class="big"
	on:click={() => void midi_input?.init()}
	{disabled}
	title={midi_input ? ($midi_access ? 'MIDI is ready!' : 'connect your MIDI device') : 'loading...'}
>
	{#if $midi_access}
		{#if midi_inputs?.length}
			🎶
			{#each midi_inputs as midi_input}
				{midi_input.name} ({midi_input.type}, {midi_input.manufacturer}, {midi_input.id})
			{/each}
		{:else}
			no MIDI devices found
		{/if}
	{:else}
		init MIDI
	{/if}
</button>
