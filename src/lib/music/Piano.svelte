<script lang="ts">
	import PianoKey from '$lib/music/PianoKey.svelte';
	import {midiNaturals, midiChromas} from '$lib/music/notes';
	import {MIDI_MIN, MIDI_MAX} from '$lib/music/midi';

	export let width: number;
	export let midiMin: Midi = MIDI_MIN;
	export let midiMax: Midi = MIDI_MAX;
	export let onPressKey: ((midi: Midi) => void) | undefined = undefined; // TODO event
	export let enabledKeys: Set<Midi> | undefined = undefined;
	export let highlightedKeys: Set<Midi> | undefined = undefined;
	export let emphasizedKeys: Set<Midi> | undefined = undefined;

	const isKeyEnabled = (key: Midi, enabledKeys): boolean => !enabledKeys || enabledKeys.has(key); // (key: Midi, enabledKeys: Set<Midi> | undefined): boolean

	const isKeyHighlighted = (key, highlightedKeys): boolean => !!highlightedKeys?.has(key); // (key: Midi, highlightedKeys: Set<Midi> | undefined): boolean

	const isKeyEmphasized = (key, emphasizedKeys): boolean => !!emphasizedKeys?.has(key); // (key: Midi, emphasizedKeys: Set<Midi> | undefined): boolean

	$: noteCount = midiMax - midiMin + 1;
	$: accidentalKeyWidth = Math.floor(width / noteCount);
	$: naturalKeyHeight = accidentalKeyWidth * KEY_HEIGHT_MULT;

	const UNRENDERED_PIANO_WIDTH = -1;
	const KEY_HEIGHT_MULT = 5; // width * mult = height // TODO - make dependent on container?
	const ACCIDENTAL_KEY_WIDTH_MULT = 7 / 12;
	const ACCIDENTAL_KEY_HEIGHT_MULT = 0.7;

	// TODO calculate layout more precisely?
	const pcLeftOffsetPct = {
		//  Record<Chroma, number>
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

	const computePianoKeys = (
		width,
		midiMin,
		midiMax,
		noteCount,
		accidentalKeyWidth,
		naturalKeyHeight,
	) => {
		const naturalKeyWidth = Math.floor(accidentalKeyWidth / ACCIDENTAL_KEY_WIDTH_MULT);
		const accidentalKeyHeight = naturalKeyHeight * ACCIDENTAL_KEY_HEIGHT_MULT;

		const keys = [];
		for (let i = 0; i < noteCount; i++) {
			const midi = i + midiMin;
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

<div class="piano" style="position: relative; width: {width}px">
	<div class="piano-keys" style="height: {naturalKeyHeight}px">
		{#each pianoKeys as key (key.midi)}
			<PianoKey
				midi={key.midi}
				leftOffset={key.leftOffset}
				width={key.width}
				height={key.height}
				isEnabled={isKeyEnabled(key.midi, enabledKeys)}
				isHighlighted={isKeyHighlighted(key.midi, highlightedKeys)}
				isEmphasized={isKeyEmphasized(key.midi, emphasizedKeys)}
				onPress={onPressKey}
			/>
		{/each}
	</div>
</div>
