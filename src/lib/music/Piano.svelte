<script lang="ts">
	import PianoKey from '$lib/music/PianoKey.svelte';
	import {midi_naturals, midi_chromas, type Chroma, compute_naturals} from '$lib/music/notes';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music/midi';

	export let width: number;
	export let midi_min: Midi = MIDI_MIN;
	export let midi_max: Midi = MIDI_MAX;
	export let enabled_keys: Set<Midi> | null = null;
	export let highlighted_keys: Set<Midi> | null = null;
	export let emphasized_keys: Set<Midi> | null = null;

	const is_key_enabled = (key: Midi, enabled_keys: Set<Midi> | null): boolean =>
		!enabled_keys || enabled_keys.has(key);

	const is_key_highlighted = (key: Midi, highlighted_keys: Set<Midi> | null): boolean =>
		!!highlighted_keys?.has(key);

	const is_key_emphasized = (key: Midi, emphasized_keys: Set<Midi> | null): boolean =>
		!!emphasized_keys?.has(key);

	$: noteCount = midi_max - midi_min + 1;
	$: naturals = compute_naturals(midi_min, midi_max);
	$: natural_key_width = Math.floor(width / naturals.length);
	$: accidental_key_width = natural_key_width * ACCIDENTAL_KEY_WIDTH_MULT;
	$: natural_key_height = accidental_key_width * KEY_HEIGHT_MULT;

	const KEY_HEIGHT_MULT = 5; // width * mult = height // TODO - make dependent on container?
	const ACCIDENTAL_KEY_WIDTH_MULT = 7 / 12;
	const ACCIDENTAL_KEY_HEIGHT_MULT = 0.7;

	// TODO calculate layout more precisely?
	const pc_left_offset_pct: Record<Chroma, number> = {
		0: 0,
		1: 0,
		2: -1 / 3,
		3: 0,
		4: -2 / 3,
		5: 0,
		6: 0,
		7: -1 / 4,
		8: 0,
		9: -1 / 2,
		10: 0,
		11: -3 / 4,
	};

	interface PianoKey {
		midi: Midi;
		left_offset: number;
		width: number;
		height: number;
	}

	const compute_piano_keys = (
		midi_min: Midi,
		noteCount: number,
		natural_key_width: number,
		accidental_key_width: number,
		natural_key_height: number,
	): PianoKey[] => {
		const accidental_key_height = natural_key_height * ACCIDENTAL_KEY_HEIGHT_MULT;

		const keys: PianoKey[] = [];
		for (let i = 0; i < noteCount; i++) {
			const midi = (i + midi_min) as Midi;
			let key_width; // number
			let key_height; // number
			if (midi_naturals.has(midi)) {
				key_width = natural_key_width;
				key_height = natural_key_height;
			} else {
				key_width = accidental_key_width;
				key_height = accidental_key_height;
			}
			const left_offset =
				i * accidental_key_width + pc_left_offset_pct[midi_chromas[midi]] * accidental_key_width;

			keys.push({
				midi,
				left_offset,
				width: key_width,
				height: key_height,
			});
		}

		return keys;
	};
	$: piano_keys = compute_piano_keys(
		midi_min,
		noteCount,
		natural_key_width,
		accidental_key_width,
		natural_key_height,
	);
</script>

<div class="piano" style:width="{width}px">
	<div class="piano-keys" style:height="{natural_key_height}px">
		{#each piano_keys as key (key.midi)}
			<PianoKey
				midi={key.midi}
				left_offset={key.left_offset}
				width={key.width}
				height={key.height}
				enabled={is_key_enabled(key.midi, enabled_keys)}
				highlighted={is_key_highlighted(key.midi, highlighted_keys)}
				emphasized={is_key_emphasized(key.midi, emphasized_keys)}
				on:press
			/>
		{/each}
	</div>
</div>

<style>
	.piano {
		position: relative;
	}
</style>
