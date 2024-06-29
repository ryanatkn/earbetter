<script lang="ts">
	import {plural} from '@ryanatkn/belt/string.js';
	import {swallow} from '@ryanatkn/belt/dom.js';

	import Piano from '$lib/Piano.svelte';
	import {get_audio_context} from '$lib/audio_context.js';
	import {midi_access} from '$lib/midi_access.js';
	import Midi_Input from '$lib/Midi_Input.svelte';
	import {playing_notes, start_playing, stop_playing} from '$lib/play_note.js';
	import Init_Midi_Button from '$lib/Init_Midi_Button.svelte';
	import Volume_Control from '$lib/Volume_Control.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers.js';
	import Instrument_Control from '$lib/Instrument_Control.svelte';
	import {
		Midi,
		serialize_notes,
		scales,
		Scale,
		parse_notes,
		DEFAULT_PITCH_CLASS,
		pitch_classes,
		to_notes_in_scale,
	} from '$lib/music.js';

	// TODO @multiple naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		notes: Set<Midi>;
		min_note: Midi;
		max_note: Midi;
		oninput?: (notes: Midi[] | null) => void; // TODO @multiple set reactivity - API is strange returning an array but taking a set (maybe return both?)
	}

	const {notes, min_note, max_note, oninput}: Props = $props();

	// TODO @multiple set reactivity - refactor these collections to use `svelte/reactivity` sets instead of cloning, upstream and downstream where appropriate

	let updated_notes: Set<Midi> | undefined = $state();
	const updated_notes_array: Midi[] | undefined = $derived(
		updated_notes && Array.from(updated_notes).sort((a, b) => a - b),
	);

	const current_notes = $derived(updated_notes ?? notes);
	const notes_count = $derived(current_notes.size);

	const serialized_updated_notes = $derived(
		updated_notes_array && serialize_notes(updated_notes_array),
	);
	const update_serialized_updated_notes = (s: string): void => {
		updated_notes = new Set(parse_notes(s)); // de-dupes
	};

	const serialized_notes = $derived(serialize_notes(Array.from(notes).sort((a, b) => a - b)));
	const changed = $derived(!!updated_notes_array && serialized_updated_notes !== serialized_notes);

	const toggle_note = (note: Midi): void => {
		const updated = new Set(current_notes);
		if (updated.has(note)) {
			updated.delete(note);
		} else {
			updated.add(note);
		}
		updated_notes = updated;
	};

	$inspect(`notes`, current_notes);

	// TODO lots of copypasta below

	let key = $state(DEFAULT_PITCH_CLASS);

	const ac = get_audio_context();
	const volume = get_volume();
	const instrument = get_instrument();

	// TODO hacky
	let innerWidth: number | undefined = $state();

	const piano_padding = 20;

	const play = (note: Midi, velocity: number | null = null): void => {
		start_playing(ac(), note, with_velocity($volume, velocity), $instrument);
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

<svelte:window bind:innerWidth />

<Midi_Input
	{midi_access}
	onnotestart={(note, velocity) => play(note, velocity)}
	onnotestop={(note) => stop_playing(note)}
/>

<div class="notes_input">
	<div class="notes width_sm">
		<!-- TODO copy button -->
		<blockquote class="panel" style:margin="var(--space_lg) 0">
			<textarea
				value={serialized_updated_notes}
				onchange={(e) => update_serialized_updated_notes(e.currentTarget.value)}
			></textarea>
		</blockquote>
		{@render buttons()}
	</div>
	<div class="piano_wrapper" style:padding="{piano_padding}px">
		{#if innerWidth}
			<!-- TODO @multiple hacky width -->
			<Piano
				width={innerWidth - piano_padding * 5}
				{min_note}
				{max_note}
				max_height={300}
				pressed_keys={$playing_notes}
				highlighted_keys={current_notes}
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
		<label style:margin-bottom="var(--space_lg)"
			>key <select bind:value={key}>
				{#each pitch_classes as pc (pc)}
					<option value={pc}>{pc}</option>
				{/each}
			</select></label
		>
		<div class="scales mb_lg">
			{#each scales as scale (scale.name)}
				<button onclick={() => toggle_scale(scale)}>{scale.name}</button>
			{/each}
		</div>
		{@render buttons()}
	</section>
	<form class="width_sm panel p_md">
		<fieldset>
			<Instrument_Control {instrument} />
			<Volume_Control {volume} />
		</fieldset>
		<fieldset>
			<Init_Midi_Button />
		</fieldset>
	</form>
</div>

{#snippet buttons()}
	<button
		class="mb_lg"
		type="button"
		onclick={(e) => {
			swallow(e);
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
		onclick={(e) => {
			swallow(e);
			oninput?.(updated_notes_array!);
		}}
	>
		select {#if notes_count === 0}all{:else}{notes_count}{/if} tonic{plural(notes_count)}
	</button>
{/snippet}

<style>
	.notes_input {
		width: var(--notes_input_width, auto); /* TODO @multiple hacky width */
		max-width: calc(100vw - 120px); /* TODO @multiple hacky width */
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
		max-width: var(--width_md);
		justify-content: center;
	}
</style>
