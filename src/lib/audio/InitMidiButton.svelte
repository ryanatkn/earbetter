<script lang="ts">
	import type MidiAccess from '$lib/audio/MidiAccess.svelte';

	export let midi_access: MidiAccess | undefined;

	// TODO move MIDI initialization to some other action, like the button to start a level

	$: ma = midi_access?.ma;
	$: disabled = !midi_access || !!$ma;

	$: midi_inputs = $ma && Array.from($ma.inputs.values());
</script>

<button
	type="button"
	class="big"
	on:click={() => void midi_access?.init()}
	{disabled}
	title={midi_access ? ($ma ? 'MIDI is ready!' : 'connect your MIDI device') : 'loading...'}
>
	{#if $ma}
		{#if midi_inputs?.length}
			🎶
			{#each midi_inputs as midi_input}
				{midi_input.name} ({midi_input.type}, {midi_input.manufacturer}, {midi_input.id})
			{/each}
		{:else}
			no MIDI devices found :[
		{/if}
	{:else}
		init MIDI
	{/if}
</button>
