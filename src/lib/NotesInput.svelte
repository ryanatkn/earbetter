<script lang="ts">
	import {z} from 'zod';
	import {effect, signal} from '@preact/signals-core';
	import {plural, swallow} from '@feltjs/util';
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
	import {Midi, serialize_notes, Notes, scales, Scale, parse_notes} from '$lib/music';
	import {load_from_storage, set_in_storage} from '$lib/storage';

	const dispatch = createEventDispatcher<{
		input: Notes | null;
	}>();

	export let notes: Set<Midi> | null;

	// TODO this is hacky, does a double conversion with the parent component, see the comment at the usage site
	let notes_array: Notes | null = notes ? Array.from(notes).sort((a, b) => a - b) : null;
	$: notes_array = notes ? Array.from(notes).sort((a, b) => a - b) : null;

	$: notes_str = serialize_notes(notes_array);
	const update_notes_str = (s: string): void => {
		// TODO BLOCK the way we're doing this doesn't allow the user to type
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

	// TODO extract? is pretty specific
	const PianoSettings = z.object({
		note_min: Midi.default(36),
		note_max: Midi.default(96),
	});
	type PianoSettings = z.infer<typeof PianoSettings>;
	const SITE_DATA_STORAGE_KEY = 'piano';
	const initial_piano_settings = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => PianoSettings.parse({}),
		PianoSettings.parse,
	);

	const note_min = signal(initial_piano_settings.note_min);
	const note_max = signal(initial_piano_settings.note_max);

	const to_piano_data = (): PianoSettings => ({
		note_min: note_min.value,
		note_max: note_max.value,
	});
	const save_piano_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_piano_data());
	effect(save_piano_data);

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

	// TODO BLOCK scope by lowest/highest MIDI key
	// TODO BLOCK calculate the notes for the scale across the lowest/highest MIDI

	const toggle_scale = (scale: Scale): void => {
		const scale_notes = scale.notes;
		// TODO this is a hacky and slow but it approximates the desired UX, is not ideal,
		// I think the best UX would be to detect if each scale is currently fully active
		if (!notes_array) {
			notes_array = scale_notes.slice();
			return;
		}
		let fully_included = true;
		for (const n of scale_notes) {
			if (!notes_array.includes(n)) {
				fully_included = false;
				break;
			}
		}
		const next_notes = fully_included
			? notes_array.filter((n) => !scale_notes.includes(n))
			: notes_array.concat(scale_notes);
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
	<div class="notes column-sm markup">
		<!-- TODO copy button -->
		<blockquote class="panel">
			<textarea bind:value={notes_str} on:input={(e) => update_notes_str(e.currentTarget.value)} />
		</blockquote>
		<button
			type="button"
			on:click={(e) => {
				swallow(e);
				dispatch('input', null);
			}}>select all tonics</button
		>
		<button
			type="button"
			class="accent"
			disabled={!notes_count || !notes_array}
			on:click={(e) => {
				swallow(e);
				dispatch('input', notes_array);
			}}>select {notes_count} tonic{plural(notes_count)}</button
		>
	</div>
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if innerWidth}
			<Piano
				width={innerWidth - piano_padding * 2}
				note_min={$note_min}
				note_max={$note_max}
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
	<section class="scales">
		{#each scales as scale (scale.name)}
			<button on:click={() => toggle_scale(scale)}>{scale.name}</button>
		{/each}
	</section>
	<form class="column-sm markup panel padded-md">
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
