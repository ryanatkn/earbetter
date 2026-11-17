<script lang="ts">
	import { plural } from '@fuzdev/fuz_util/string.ts';
	import type { Snippet } from 'svelte';
	import type { SvelteSet } from 'svelte/reactivity';
	import { innerWidth } from 'svelte/reactivity/window';

	import Piano from './Piano.svelte';
	import { audio_context_context } from './audio_context.ts';
	import MidiInput from './MidiInput.svelte';
	import { start_playing, stop_playing } from './play_note.ts';
	import InitMidiButton from './InitMidiButton.svelte';
	import VolumeControl from './VolumeControl.svelte';
	import { Instrument, Volume, with_velocity } from './audio_helpers.ts';
	import InstrumentControl from './InstrumentControl.svelte';
	import {
		Midi,
		serialize_notes,
		scales,
		Scale,
		parse_notes,
		DEFAULT_PITCH_CLASS,
		pitch_classes,
		to_notes_in_scale
	} from './music.ts';

	// TODO @many naming convention between `IntervalsInput`/`NotesInput`/`SelectNotesControl`?

	interface Props {
		audio_state: {
			volume: Volume;
			instrument: Instrument;
			playing_notes: SvelteSet<Midi>;
			midi_access: MIDIAccess | null;
			readonly midi_inputs: ReadonlyArray<MIDIInput> | null;
		};
		notes: Set<Midi>;
		min_note: Midi;
		max_note: Midi;
		before_buttons: Snippet;
		oninput?: (notes: Array<Midi> | null) => void; // TODO @many set reactivity - API is strange returning an array but taking a set (maybe return both?)
	}

	const { audio_state, notes, min_note, max_note, before_buttons, oninput }: Props = $props();

	const playing_notes = $derived(audio_state.playing_notes);

	// TODO @many set reactivity - refactor these collections to use `svelte/reactivity` sets instead of cloning, upstream and downstream where appropriate

	// the draft, `null` until the player changes something, and reset when the `notes` prop changes
	let updated_notes: Set<Midi> | null = $derived.by((): Set<Midi> | null => {
		notes;
		return null;
	});
	const updated_notes_array: Array<Midi> | null = $derived(
		updated_notes && Array.from(updated_notes).sort((a, b) => a - b)
	);

	const current_notes = $derived(updated_notes ?? notes);
	const notes_count = $derived(current_notes.size);

	const serialized_updated_notes = $derived(
		updated_notes_array && serialize_notes(updated_notes_array)
	);
	const update_serialized_updated_notes = (s: string): void => {
		updated_notes = new Set(parse_notes(s)); // de-dupes
	};

	const serialized_notes = $derived(serialize_notes(Array.from(notes).sort((a, b) => a - b)));
	const changed = $derived(!!updated_notes_array && serialized_updated_notes !== serialized_notes);

	const toggle_note = (note: Midi): void => {
		const updated = new Set(current_notes); // eslint-disable-line svelte/prefer-svelte-reactivity
		if (updated.has(note)) {
			updated.delete(note);
		} else {
			updated.add(note);
		}
		updated_notes = updated;
	};

	// TODO lots of copypasta below

	let key = $state(DEFAULT_PITCH_CLASS);

	const ac = audio_context_context.get();

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		start_playing(
			audio_state,
			ac(),
			note,
			with_velocity(audio_state.volume, velocity),
			audio_state.instrument
		);
	};

	const toggle_scale = (scale: Scale): void => {
		const scale_notes = to_notes_in_scale(scale, key, min_note, max_note);
		// TODO this is a hacky and slow but it approximates the desired UX, is not ideal,
		// I think the best UX would be to detect if each scale is currently fully active
		if (!updated_notes || !updated_notes_array) {
			updated_notes = scale_notes;
			return;
		}
		let fully_included = true;
		for (const n of scale_notes) {
			if (!updated_notes.has(n)) {
				fully_included = false;
				break;
			}
		}
		const next_notes = fully_included
			? updated_notes_array.filter((n) => !scale_notes.has(n))
			: updated_notes_array.concat(Array.from(scale_notes));
		updated_notes = new Set(next_notes);
	};
</script>

<MidiInput
	inputs={audio_state.midi_inputs}
	onnotestart={(note, velocity) => play(note, velocity)}
	onnotestop={(note) => stop_playing(note)}
/>

<div class="notes_input pt_lg">
	{@render buttons()}
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if innerWidth.current}
			<!-- TODO @many hacky width -->
			<Piano
				width={innerWidth.current - piano_padding * 5}
				{min_note}
				{max_note}
				max_height={300}
				pressed_keys={playing_notes}
				highlighted_keys={current_notes}
				middle_c_label
				allow_sticking
				onpress={(note) => {
					toggle_note(note);
					play(note);
				}}
				onrelease={(note) => {
					stop_playing(note);
				}}
			/>
		{/if}
	</div>
	<section class="box">
		<label class="mb_lg">
			<div class="title text-align:center">key</div>
			<select bind:value={key}>
				{#each pitch_classes as pc (pc)}
					<option value={pc}>{pc}</option>
				{/each}
			</select>
		</label>
		<div class="scales mb_lg">
			{#each scales as scale (scale.name)}
				<button type="button" onclick={() => toggle_scale(scale)}>{scale.name}</button>
			{/each}
		</div>
		{@render buttons()}
		<div class="notes width_atmost_sm">
			<!-- TODO copy button -->
			<blockquote class="panel my_lg">
				<textarea
					value={serialized_updated_notes}
					onchange={(e) => update_serialized_updated_notes(e.currentTarget.value)}></textarea>
			</blockquote>
		</div>
	</section>
	<form class="width_atmost_sm panel p_md">
		<fieldset>
			<InstrumentControl bind:instrument={audio_state.instrument} />
			<VolumeControl bind:volume={audio_state.volume} />
		</fieldset>
		<fieldset>
			<InitMidiButton midi_state={audio_state} />
		</fieldset>
	</form>
</div>

{#snippet buttons()}
	{@render before_buttons()}
	<button
		class="mb_lg"
		type="button"
		onclick={() => {
			updated_notes = new Set();
		}}
		disabled={notes_count === 0}
	>
		clear selection
	</button>
	<button
		type="button"
		class="accent"
		disabled={!changed}
		onclick={() => {
			oninput?.(updated_notes_array);
		}}
	>
		select {#if notes_count === 0}all{:else}{notes_count}{/if} tonic{plural(notes_count)}
	</button>
{/snippet}

<style>
	.notes_input {
		width: var(--notes_input_width, auto); /* TODO @many hacky width */
		max-width: calc(100vw - 120px); /* TODO @many hacky width */
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
		padding: var(--space_md);
	}
	.scales {
		display: flex;
		flex-wrap: wrap;
		max-width: var(--distance_md);
		justify-content: center;
	}
</style>
