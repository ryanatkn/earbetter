<script lang="ts">
	import {plural} from '@grogarden/util/string.js';
	import {swallow} from '@grogarden/util/dom.js';
	import {createEventDispatcher} from 'svelte';

	import Piano from '$lib/Piano.svelte';
	import {get_ac} from '$lib/ac';
	import {midi_access} from '$lib/midi_access';
	import MidiInput from '$lib/MidiInput.svelte';
	import {playing_notes, start_playing, stop_playing} from '$lib/play_note';
	import InitMidiButton from '$lib/InitMidiButton.svelte';
	import VolumeControl from '$lib/VolumeControl.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers';
	import InstrumentControl from '$lib/InstrumentControl.svelte';
	import {
		Midi,
		serialize_notes,
		Notes,
		scales,
		Scale,
		parse_notes,
		DEFAULT_PITCH_CLASS,
		pitch_classes,
		to_notes_in_scale,
	} from '$lib/music';

	const dispatch = createEventDispatcher<{
		input: Notes | null;
	}>();

	export let notes: Set<Midi> | null;
	export let min_note: Midi;
	export let max_note: Midi;

	// TODO this is hacky, does a double conversion with the parent component, see the comment at the usage site
	let notes_array: Notes | null = notes ? Array.from(notes).sort((a, b) => a - b) : null;
	$: notes_array = notes ? Array.from(notes).sort((a, b) => a - b) : null;

	$: notes_str = serialize_notes(notes_array);
	const update_notes_str = (s: string): void => {
		// TODO the way we're doing this doesn't allow the user to type
		notes = new Set(parse_notes(s));
	};

	$: notes_count = notes_array ? notes_array.length : 0;

	const toggle_note = (note: Midi): void => {
		if (notes?.has(note)) {
			notes = new Set(notes);
			notes.delete(note);
		} else {
			notes = notes ? new Set(notes) : new Set();
			notes.add(note);
		}
	};

	$: console.log(`notes`, notes);

	// TODO lots of copypasta below

	let key = DEFAULT_PITCH_CLASS;

	const ac = get_ac();
	const volume = get_volume();
	const instrument = get_instrument();

	$: pressed_keys = $playing_notes;

	// TODO hacky
	let innerWidth: number; // `undefined` on first render

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		start_playing(ac, note, with_velocity($volume, velocity), $instrument);
	};

	const toggle_scale = (scale: Scale): void => {
		const scale_notes = to_notes_in_scale(scale, key, min_note, max_note);
		// TODO this is a hacky and slow but it approximates the desired UX, is not ideal,
		// I think the best UX would be to detect if each scale is currently fully active
		if (!notes || !notes_array) {
			notes = scale_notes;
			return;
		}
		let fully_included = true;
		for (const n of scale_notes) {
			if (!notes.has(n)) {
				fully_included = false;
				break;
			}
		}
		const next_notes = fully_included
			? notes_array.filter((n) => !scale_notes.has(n))
			: notes_array.concat(Array.from(scale_notes));
		notes = new Set(next_notes);
	};
</script>

<svelte:window bind:innerWidth />

<MidiInput
	{midi_access}
	on:note_start={(e) => play(e.detail.note, e.detail.velocity)}
	on:note_stop={(e) => stop_playing(e.detail.note)}
/>

<div class="notes_input">
	<div class="notes column-sm">
		<!-- TODO copy button -->
		<blockquote class="panel" style:margin="var(--spacing_lg) 0">
			<textarea bind:value={notes_str} on:input={(e) => update_notes_str(e.currentTarget.value)} />
		</blockquote>
		<button
			type="button"
			on:click={(e) => {
				swallow(e);
				notes = null;
			}}
			disabled={!notes?.size}>clear selection</button
		>
		<button
			type="button"
			class="accent"
			on:click={(e) => {
				swallow(e);
				dispatch('input', notes_array);
			}}
			>select {#if notes_count === 0}all{:else}{notes_count}{/if} tonic{plural(notes_count)}</button
		>
	</div>
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if innerWidth}
			<Piano
				width={innerWidth - piano_padding * 2}
				{min_note}
				{max_note}
				max_height={300}
				{pressed_keys}
				highlighted_keys={notes}
				on:press={(e) => {
					toggle_note(e.detail);
					play(e.detail);
				}}
				on:release={(e) => {
					stop_playing(e.detail);
				}}
			/>
		{/if}
	</div>
	<section class="centered">
		<label style:margin-bottom="var(--spacing_lg)"
			>key <select bind:value={key}>
				{#each pitch_classes as pc (pc)}
					<option value={pc}>{pc}</option>
				{/each}
			</select></label
		>
		<div class="scales">
			{#each scales as scale (scale.name)}
				<button on:click={() => toggle_scale(scale)}>{scale.name}</button>
			{/each}
		</div>
	</section>
	<form class="column-sm prose panel padded-md">
		<fieldset>
			<InstrumentControl {instrument} />
			<VolumeControl {volume} />
		</fieldset>
		<fieldset>
			<InitMidiButton />
		</fieldset>
	</form>
</div>

<style>
	.notes_input {
		width: var(--notes_input_width, auto);
		display: flex;
		align-items: center;
		flex-direction: column;
		/* TODO hacky but better than not, need to fix the dialog container */
		background-color: var(--bg);
	}
	.notes {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.piano_wrapper {
		padding: var(--spacing_md);
	}
	.scales {
		display: flex;
		flex-wrap: wrap;
		max-width: var(--column_width);
		justify-content: center;
	}
</style>
