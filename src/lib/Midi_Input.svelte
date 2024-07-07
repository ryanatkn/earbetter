<script lang="ts">
	import {onDestroy} from 'svelte';

	import {type MIDIMessageEvent, MIDICommand, type MIDIAccess} from '$lib/WebMIDI.js';
	import {parse_midi_message} from '$lib/midi_helpers.js';
	import type {Midi} from '$lib/music.js';

	const log = console.log.bind(console);

	interface Props {
		midi_access: Signal<MIDIAccess | null>;
		onnotestart?: (note: Midi, velocity: number) => void;
		onnotestop?: (note: Midi, velocity: number) => void;
		onpadstart?: (note: Midi, velocity: number) => void;
		onpadstop?: (note: Midi, velocity: number) => void;
		onmodwheel?: (velocity: number) => void;
	}

	const {midi_access, onnotestart, onnotestop, onpadstart, onpadstop, onmodwheel}: Props = $props();

	$inspect('midi_access', midi_access);

	const onmidimessage = (event: MIDIMessageEvent): void => {
		const message = parse_midi_message(event);
		const {command, channel, note, velocity} = message;
		log('midimessage', command, message);

		switch (command) {
			case MIDICommand.Stop: {
				if (channel === 0) {
					onnotestop?.(note, velocity);
				} else if (channel === 9) {
					onpadstop?.(note, velocity);
				} else {
					log('unknown MIDI stop command', message);
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
				} else {
					log('unknown MIDI start command', message);
				}
				break;
			}
			case MIDICommand.Knob: {
				if (note === 1) {
					onmodwheel?.(velocity);
				} else {
					log('unknown MIDI knob command', message);
				}
				break;
			}
			case MIDICommand.PitchBend: {
				log('unhandled MIDI pitch bend', message);
				break;
			}
			default: {
				log('unrecognized MIDI command', message);
			}
		}
	};

	const unsubscribers: Array<() => void> = [];
	const unsubscribe = (): void => {
		for (const u of unsubscribers) u();
		unsubscribers.length = 0;
	};
	onDestroy(unsubscribe);

	const subscribe = ($ma: MIDIAccess | null) => {
		if (unsubscribers.length) unsubscribe();
		if (!$ma) return;
		for (const input of $ma.inputs.values()) {
			input.addEventListener('midimessage', onmidimessage as any);
			unsubscribers.push(() => {
				input.removeEventListener('midimessage', onmidimessage as any);
			});
		}
	};

	$effect(() => subscribe($midi_access));
</script>
