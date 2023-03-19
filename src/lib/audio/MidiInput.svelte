<script lang="ts">
	import {createEventDispatcher, onDestroy} from 'svelte';
	import type {Writable} from 'svelte/store';

	import {type MIDIMessageEvent, MIDICommand, type MIDIAccess} from '$lib/audio/WebMIDI';
	import {parse_midi_message} from '$lib/audio/midi_helpers';
	import type {Midi} from '$lib/music/midi';

	const log = console.log.bind(console);

	const dispatch = createEventDispatcher<{
		note_start: {note: Midi; velocity: number};
		note_stop: {note: Midi; velocity: number};
		pad_start: {note: Midi; velocity: number};
		pad_stop: {note: Midi; velocity: number};
		mod_wheel: number; // velocity
	}>();

	export let ma: Writable<MIDIAccess | null>;

	console.log('ma', ma);

	const midimessage = (event: MIDIMessageEvent): void => {
		const message = parse_midi_message(event);
		const {command, channel, note, velocity} = message;
		log('midimessage', command, message);

		switch (command) {
			case MIDICommand.Stop: {
				if (channel === 0) {
					dispatch('note_stop', {note, velocity});
				} else if (channel === 9) {
					dispatch('pad_stop', {note, velocity});
				} else {
					log('unknown MIDI stop command', message);
				}
				break;
			}
			case MIDICommand.Start: {
				if (channel === 0) {
					if (velocity === 0) {
						// this is weird but seems to be correct
						dispatch('note_stop', {note, velocity});
					} else {
						dispatch('note_start', {note, velocity});
					}
				} else if (channel === 9) {
					if (velocity === 0) {
						// this is weird but seems to be correct
						dispatch('pad_stop', {note, velocity});
					} else {
						dispatch('pad_start', {note, velocity});
					}
				} else {
					log('unknown MIDI start command', message);
				}
				break;
			}
			case MIDICommand.Knob: {
				if (note === 1) {
					dispatch('mod_wheel', velocity);
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
		log(`subscribe $ma`, $ma);
		if (unsubscribers.length) unsubscribe();
		if (!$ma) return;
		for (const input of $ma.inputs.values()) {
			log('subscribing to midi input', input);
			input.addEventListener('midimessage', midimessage as any);
			unsubscribers.push(() => {
				log('unsubscribing to midi input', input);
				input.removeEventListener('midimessage', midimessage as any);
			});
		}
	};

	$: subscribe($ma);
</script>
