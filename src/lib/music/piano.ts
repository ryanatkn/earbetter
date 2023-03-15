import type {Midi} from '$lib/music/midi';
import {compute_naturals, midi_chromas, midi_naturals, type Chroma} from '$lib/music/notes';

const KEY_HEIGHT_MULT = 5; // width * mult = height // TODO - make dependent on container?
const ACCIDENTAL_KEY_WIDTH_MULT = 7 / 12;
const ACCIDENTAL_KEY_HEIGHT_MULT = 0.7;

// TODO calculate layout more precisely? these are eyeballed
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

export const compute_piano_keys = (
	width: number,
	midi_min: Midi,
	midi_max: Midi,
): {piano_keys: PianoKey[]; natural_key_height: number} => {
	const note_count = midi_max - midi_min + 1;
	const naturals = compute_naturals(midi_min, midi_max);
	const natural_key_width = Math.floor(width / naturals.length);
	const accidental_key_width = natural_key_width * ACCIDENTAL_KEY_WIDTH_MULT;
	const natural_key_height = Math.min(600, accidental_key_width * KEY_HEIGHT_MULT);

	const accidental_key_height = natural_key_height * ACCIDENTAL_KEY_HEIGHT_MULT;

	const piano_keys: PianoKey[] = [];
	for (let i = 0; i < note_count; i++) {
		const midi = (i + midi_min) as Midi;
		let key_width: number;
		let key_height: number;
		let left_offset: number;
		if (midi_naturals.has(midi)) {
			key_width = natural_key_width;
			key_height = natural_key_height;
			left_offset =
				i * accidental_key_width + pc_left_offset_pct[midi_chromas[midi]] * accidental_key_width;
		} else {
			key_width = accidental_key_width;
			key_height = accidental_key_height;
			left_offset =
				i * accidental_key_width + pc_left_offset_pct[midi_chromas[midi]] * accidental_key_width;
		}

		piano_keys.push({
			midi,
			left_offset,
			width: key_width,
			height: key_height,
		});
	}

	return {piano_keys, natural_key_height};
};
