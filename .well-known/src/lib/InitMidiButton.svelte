<script lang="ts">
	import type {Async_Status} from '@grogarden/util/async.js';
	import {fade} from 'svelte/transition';
	import type {Signal} from '@preact/signals-core';

	import type {MIDIAccess} from '$lib/WebMIDI';
	import {
		midi_access as default_midi_access,
		request_access as default_request_access,
	} from '$lib/midi_access';

	export let midi_access: Signal<MIDIAccess | null> = default_midi_access;
	export const request_access: () => Promise<MIDIAccess | null> = default_request_access;

	// TODO move MIDI initialization to some other action, like the button to start a level

	let request_status: Async_Status = 'initial';

	$: disabled = !!$midi_access || request_status === 'pending';

	$: midi_inputs = $midi_access && Array.from($midi_access.inputs.values());

	let request_error: string | undefined;
</script>

<button
	type="button"
	class="big"
	on:click={async () => {
		if (!midi_access) return;
		request_status = 'pending';
		try {
			await request_access();
			request_status = 'success';
		} catch (err) {
			console.error('failed to request midi access', err);
			request_status = 'failure';
			request_error = err.message;
		}
	}}
	{disabled}
	title={$midi_access ? 'MIDI is ready!' : 'connect your MIDI device [c]'}
>
	{#if $midi_access}
		{#if midi_inputs?.length}
			<div>
				<div>🎶</div>
				<ul>
					{#each midi_inputs as midi_input}
						<li><small>{midi_input.name}</small></li>
					{/each}
				</ul>
			</div>
		{:else}
			<span in:fade|local>no MIDI devices found</span>
		{/if}
	{:else if request_status === 'pending'}
		<span in:fade|local>requesting MIDI access</span>
	{:else if request_status === 'failure'}
		<span in:fade|local
			>failed to request MIDI access{#if request_error}: {request_error}{/if}</span
		>
	{:else}
		connect MIDI &nbsp;<code>c</code>
	{/if}
</button>

<style>
	button {
		width: 100%;
	}
	li {
		list-style: none;
		text-align: left;
	}
</style>
