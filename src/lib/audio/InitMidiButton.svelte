<script lang="ts">
	import type {AsyncStatus} from '@feltjs/util';
	import {fade} from 'svelte/transition';
	import type {Writable} from 'svelte/store';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import {request_access} from '$lib/audio/midi_access';

	export let midi_access: Writable<MIDIAccess | null>;

	// TODO move MIDI initialization to some other action, like the button to start a level

	let request_status: AsyncStatus = 'initial';

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
			<span in:fade|local>no MIDI devices found :[</span>
		{/if}
	{:else if request_status === 'pending'}
		<span in:fade|local>requesting MIDI access</span>
	{:else if request_status === 'failure'}
		<span in:fade|local
			>failed to request MIDI access{#if request_error}: {request_error}{/if}</span
		>
	{:else}
		init MIDI
	{/if}
</button>

<style>
	li {
		list-style: none;
		text-align: left;
	}
</style>
