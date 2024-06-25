<script lang="ts">
	import {plural} from '@ryanatkn/belt/string.js';
	import {swallow} from '@ryanatkn/belt/dom.js';

	import Piano from '$lib/Piano.svelte';
	import {get_ac} from '$lib/ac.js';
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
		Notes,
		scales,
		Scale,
		parse_notes,
		DEFAULT_PITCH_CLASS,
		pitch_classes,
		to_notes_in_scale,
	} from '$lib/music.js';

	interface Props {
		notes: Set<Midi> | null;
		min_note: Midi;
		max_note: Midi;
		oninput?: (notes: Notes | null) => void;
	}

	let {notes = $bindable(), min_note, max_note, oninput}: Props = $props(); // eslint-disable-line prefer-const

	// TODO this is hacky, does a double conversion with the parent component, see the comment at the usage site
	const notes_array = $derived(notes ? Array.from(notes).sort((a, b) => a - b) : null);

	const notes_str = $derived(serialize_notes(notes_array));
	const update_notes_str = (s: string): void => {
		notes = new Set(parse_notes(s));
	};

	const notes_count = $derived(notes_array ? notes_array.length : 0);

	const toggle_note = (note: Midi): void => {
		if (notes?.has(note)) {
			notes = new Set(notes);
			notes.delete(note);
		} else {
			notes = notes ? new Set(notes) : new Set();
			notes.add(note);
		}
	};

	$inspect(`notes`, notes);

	// TODO lots of copypasta below

	let key = $state(DEFAULT_PITCH_CLASS);

	const ac = get_ac();
	const volume = get_volume();
	const instrument = get_instrument();

	// TODO hacky
	let innerWidth: number | undefined = $state();

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

<Midi_Input
	{midi_access}
	onnotestart={(note, velocity) => play(note, velocity)}
	onnotestop={(note) => stop_playing(note)}
/>

<div class="notes_input">
	<div class="notes width_sm">
		<!-- TODO copy button -->
		<blockquote class="panel" style:margin="var(--space_lg) 0">
			<textarea value={notes_str} oninput={(e) => update_notes_str(e.currentTarget.value)}
			></textarea>
		</blockquote>
		<button
			type="button"
			onclick={(e) => {
				swallow(e);
				notes = null;
			}}
			disabled={!notes?.size}>clear selection</button
		>
		<button
			type="button"
			class="accent"
			onclick={(e) => {
				swallow(e);
				oninput?.(notes_array);
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
				pressed_keys={$playing_notes}
				highlighted_keys={notes}
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
		<div class="scales">
			{#each scales as scale (scale.name)}
				<button onclick={() => toggle_scale(scale)}>{scale.name}</button>
			{/each}
		</div>
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
		padding: var(--space_md);
	}
	.scales {
		display: flex;
		flex-wrap: wrap;
		max-width: var(--width_md);
		justify-content: center;
	}
</style>
