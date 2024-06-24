import {midi_chromas, midi_naturals, type Midi, compute_naturals, type Chroma} from '$lib/music.js';

const KEY_HEIGHT_MULT = 5; // width * mult = height // TODO - make dependent on container? is this the right layout tradeoff to make in terms of aspect ratio?
const ACCIDENTAL_KEY_WIDTH_MULT = 7 / 12;
const ACCIDENTAL_KEY_HEIGHT_MULT = 0.7;

// TODO what spacing for the keys? these are eyeballed,
// and the second commented-out values are closer to my real keyboard,
// but I think it reads clearer as a piano to use the more moderate current values
const key_left_offset_pct: Record<Chroma, number> = {
	1: 0,
	2: -3 / 5, // -2 / 3,
	3: 0,
	4: -2 / 5, // -1 / 3,
	5: 0,
	6: 0,
	7: -2 / 3, // -3 / 4,
	8: 0,
	9: -1 / 2, // -1 / 2,
	10: 0,
	11: -1 / 3, // -1 / 4,
	12: 0,
};

export interface Piano {
	piano_keys: Piano_Key[];
	natural_key_height: number;
	natural_key_width: number;
	accidental_key_height: number;
	accidental_key_width: number;
}

export interface Piano_Key {
	midi: Midi;
	left_offset: number;
	width: number;
	height: number;
}

export const compute_piano = (
	width: number,
	min_note: Midi,
	max_note: Midi,
	max_height = 600,
): Piano => {
	const min_note_offset = Math.abs(key_left_offset_pct[midi_chromas[min_note]]);
	let max_note_offset = Math.abs(key_left_offset_pct[midi_chromas[max_note]]);
	if (max_note_offset) max_note_offset = 1 - max_note_offset;

	const note_count = max_note - min_note + 1;
	const naturals = compute_naturals(min_note, max_note);
	const natural_key_width = (width / (naturals.length + (min_note_offset + max_note_offset))) | 0;
	const accidental_key_width = (natural_key_width * ACCIDENTAL_KEY_WIDTH_MULT) | 0;
	const natural_key_height = Math.min(max_height, accidental_key_width * KEY_HEIGHT_MULT) | 0;
	const accidental_key_height = (natural_key_height * ACCIDENTAL_KEY_HEIGHT_MULT) | 0;

	let natural_index = 0;
	const piano_keys: Piano_Key[] = [];
	for (let i = 0; i < note_count; i++) {
		const midi = (i + min_note) as Midi;
		let key_width: number;
		let key_height: number;
		let left_offset: number;
		if (midi_naturals.has(midi)) {
			key_width = natural_key_width;
			key_height = natural_key_height;
			left_offset = natural_index * natural_key_width + min_note_offset * accidental_key_width;
			natural_index++;
		} else {
			key_width = accidental_key_width;
			key_height = accidental_key_height;
			// this could be improved but it's kinda close
			left_offset =
				natural_index * natural_key_width +
				key_left_offset_pct[midi_chromas[midi]] * accidental_key_width +
				min_note_offset * accidental_key_width;
		}

		piano_keys.push({
			midi,
			left_offset,
			width: key_width,
			height: key_height,
		});
	}

	return {
		piano_keys,
		natural_key_height,
		natural_key_width,
		accidental_key_height,
		accidental_key_width,
	};
};
