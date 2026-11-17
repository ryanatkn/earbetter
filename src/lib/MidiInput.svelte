<script lang="ts">
	import { type MIDIMessageEvent, MIDICommand, type MIDIInput } from './WebMIDI.ts';
	import { parse_midi_message } from './midi_helpers.ts';
	import type { Midi } from './music.ts';

	interface Props {
		/**
		 * The inputs to listen to, usually the reactive `App.midi_inputs`.
		 */
		inputs: ReadonlyArray<MIDIInput> | null;
		onnotestart?: (note: Midi, velocity: number) => void;
		onnotestop?: (note: Midi, velocity: number) => void;
		onpadstart?: (note: Midi, velocity: number) => void;
		onpadstop?: (note: Midi, velocity: number) => void;
		onmodwheel?: (velocity: number) => void;
	}

	const { inputs, onnotestart, onnotestop, onpadstart, onpadstop, onmodwheel }: Props = $props();

	const onmidimessage = (event: MIDIMessageEvent): void => {
		const { command, channel, note, velocity } = parse_midi_message(event);

		switch (command) {
			case MIDICommand.Stop: {
				if (channel === 0) {
					onnotestop?.(note, velocity);
				} else if (channel === 9) {
					onpadstop?.(note, velocity);
				}
				break;
			}
			case MIDICommand.Start: {
				if (channel === 0) {
					if (velocity === 0) {
						// this is weird but seems to be correct
						onnotestop?.(note, velocity);
					} else {
						onnotestart?.(note, velocity);
					}
				} else if (channel === 9) {
					if (velocity === 0) {
						// this is weird but seems to be correct
						onpadstop?.(note, velocity);
					} else {
						onpadstart?.(note, velocity);
					}
				}
				break;
			}
			case MIDICommand.Knob: {
				if (note === 1) {
					onmodwheel?.(velocity);
				}
				break;
			}
			// other commands like pitch bend are unhandled
		}
	};

	// syncs listeners on the external MIDI inputs, so this is a genuine effect,
	// and it reruns as `inputs` changes when devices connect and disconnect
	$effect(() => {
		if (!inputs) return;
		for (const input of inputs) {
			input.addEventListener('midimessage', onmidimessage as any);
		}
		return () => {
			for (const input of inputs) {
				input.removeEventListener('midimessage', onmidimessage as any);
			}
		};
	});
</script>
