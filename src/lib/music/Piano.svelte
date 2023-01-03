<script lang="ts">
	import PianoKey from '$lib/music/PianoKey.svelte';
	import {midiNaturals, midiChromas, type Chroma} from '$lib/music/notes';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music/midi';

	export let width: number;
	export let midiMin: Midi = MIDI_MIN;
	export let midiMax: Midi = MIDI_MAX;
	export let enabledKeys: Set<Midi> | null = null;
	export let highlightedKeys: Set<Midi> | null = null;
	export let emphasizedKeys: Set<Midi> | null = null;

	const isKeyEnabled = (key: Midi, enabledKeys: Set<Midi> | null): boolean =>
		!enabledKeys || enabledKeys.has(key);

	const isKeyHighlighted = (key: Midi, highlightedKeys: Set<Midi> | null): boolean =>
		!!highlightedKeys?.has(key);

	const isKeyEmphasized = (key: Midi, emphasizedKeys: Set<Midi> | null): boolean =>
		!!emphasizedKeys?.has(key);

	$: noteCount = midiMax - midiMin + 1;
	$: accidentalKeyWidth = Math.floor(width / noteCount);
	$: naturalKeyHeight = accidentalKeyWidth * KEY_HEIGHT_MULT;

	const KEY_HEIGHT_MULT = 5; // width * mult = height // TODO - make dependent on container?
	const ACCIDENTAL_KEY_WIDTH_MULT = 7 / 12;
	const ACCIDENTAL_KEY_HEIGHT_MULT = 0.7;

	// TODO calculate layout more precisely?
	const pcLeftOffsetPct: Record<Chroma, number> = {
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
		leftOffset: number;
		width: number;
		height: number;
	}

	const computePianoKeys = (
		_width: number, // TODO unused
		midiMin: Midi,
		_midiMax: Midi, // TODO unused
		noteCount: number,
		accidentalKeyWidth: number,
		naturalKeyHeight: number,
	): PianoKey[] => {
		const naturalKeyWidth = Math.floor(accidentalKeyWidth / ACCIDENTAL_KEY_WIDTH_MULT);
		const accidentalKeyHeight = naturalKeyHeight * ACCIDENTAL_KEY_HEIGHT_MULT;

		const keys: PianoKey[] = [];
		for (let i = 0; i < noteCount; i++) {
			const midi = (i + midiMin) as Midi;
			let keyWidth; // number
			let keyHeight; // number
			if (midiNaturals[midi]) {
				keyWidth = naturalKeyWidth;
				keyHeight = naturalKeyHeight;
			} else {
				keyWidth = accidentalKeyWidth;
				keyHeight = accidentalKeyHeight;
			}
			const leftOffset =
				i * accidentalKeyWidth + pcLeftOffsetPct[midiChromas[midi]] * accidentalKeyWidth;

			keys.push({
				midi,
				leftOffset,
				width: keyWidth,
				height: keyHeight,
			});
		}

		return keys;
	};
	$: pianoKeys = computePianoKeys(
		width,
		midiMin,
		midiMax,
		noteCount,
		accidentalKeyWidth,
		naturalKeyHeight,
	);
</script>

<div class="piano" style:width="{width}px">
	<div class="piano-keys" style:height="{naturalKeyHeight}px">
		{#each pianoKeys as key (key.midi)}
			<PianoKey
				midi={key.midi}
				leftOffset={key.leftOffset}
				width={key.width}
				height={key.height}
				enabled={isKeyEnabled(key.midi, enabledKeys)}
				highlighted={isKeyHighlighted(key.midi, highlightedKeys)}
				emphasized={isKeyEmphasized(key.midi, emphasizedKeys)}
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
