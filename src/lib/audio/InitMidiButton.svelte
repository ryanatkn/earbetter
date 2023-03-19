<script lang="ts">
	import type {AsyncStatus} from '@feltjs/util';

	import type MidiAccess from '$lib/audio/MidiAccess.svelte';
	import {fade} from 'svelte/transition';

	export let midi_access: MidiAccess | undefined;

	// TODO move MIDI initialization to some other action, like the button to start a level

	let request_status: AsyncStatus = 'initial';

	$: ma = midi_access?.ma;
	$: disabled = !midi_access || !!$ma || request_status === 'pending';

	$: midi_inputs = $ma && Array.from($ma.inputs.values());
</script>

<button
	type="button"
	class="big"
	on:click={async () => {
		if (!midi_access) return;
		request_status = 'pending';
		try {
			await midi_access.request_access();
			request_status = 'success';
		} catch (err) {
			console.error('failed to request midi access', err);
			request_status = 'failure';
		}
	}}
	{disabled}
	title={midi_access ? ($ma ? 'MIDI is ready!' : 'connect your MIDI device') : 'loading...'}
>
	{#if $ma}
		{#if midi_inputs?.length}
			<div>🎶</div>
			<table>
				{#each midi_inputs as midi_input}
					<tr>
						<th><small>{midi_input.name}</small></th>
						<th><small>{midi_input.id}</small></th>
					</tr>
				{/each}
			</table>
		{:else}
			no MIDI devices found :[
		{/if}
	{:else if request_status === 'pending'}
		<!-- fade in because it may be replaced immediately -->
		<span in:fade|local>requesting MIDI access</span>
	{:else}
		init MIDI
	{/if}
</button>

<style>
	th {
		padding: 0 var(--spacing_sm);
	}
</style>
