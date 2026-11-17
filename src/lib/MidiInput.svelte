<script lang="ts">
	import { MidiCommand, parse_midi_message } from './midi_helpers.ts';
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
		const message = parse_midi_message(event);
		if (!message) return;
		const { command, channel, note, velocity } = message;

		switch (command) {
			case MidiCommand.Stop: {
				if (channel === 0) {
					onnotestop?.(note, velocity);
				} else if (channel === 9) {
					onpadstop?.(note, velocity);
				}
				break;
			}
			case MidiCommand.Start: {
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
			case MidiCommand.Knob: {
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
			input.addEventListener('midimessage', onmidimessage);
		}
		return () => {
			for (const input of inputs) {
				input.removeEventListener('midimessage', onmidimessage);
			}
		};
	});
</script>
