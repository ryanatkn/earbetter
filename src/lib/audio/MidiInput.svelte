<script lang="ts" context="module">
	let global_midi_access: MIDIAccess | null = null;
</script>

<script lang="ts" accessors>
	import {createEventDispatcher} from 'svelte';
	import {writable} from 'svelte/store';

	import {type MIDIAccess, type MIDIMessageEvent, MIDICommand} from '$lib/audio/WebMIDI';
	import {requestMidiAccess, parseMidiMessage} from '$lib/audio/midi_helpers';
	import type {Midi} from '$lib/music/midi';

	const log = console.log.bind(console);

	const dispatch = createEventDispatcher<{
		note_start: {note: Midi; velocity: number};
		note_stop: {note: Midi; velocity: number};
		pad_start: {note: Midi; velocity: number};
		pad_stop: {note: Midi; velocity: number};
		mod_wheel: number; // velocity
	}>();

	export const midi_access = writable(global_midi_access); // exported for binding

	export const init = async (): Promise<void> => {
		if ($midi_access) return;
		if (global_midi_access) {
			$midi_access = global_midi_access;
			return;
		}
		// TODO how to call this better? needs to be a user-initiated action right?
		// do we need to present a screen to users that lets them opt into midi?
		try {
			$midi_access = global_midi_access = await requestMidiAccess();
			console.log('requested midi_access', $midi_access);
			initInputs();
			console.log('MIDI ready!');
		} catch (err) {
			console.error('loadMidiAccess failed', err);
			alert('Failed to request MIDI access: ' + err.message); // eslint-disable-line no-alert
		}
	};

	export const initInputs = (): void => {
		if (!$midi_access) {
			throw Error(`Cannot list midi inputs without access`);
		}
		for (const input of $midi_access.inputs.values()) {
			log('midi input', input);
			input.onmidimessage = onMidiMessage;
		}
	};

	const onMidiMessage = (event: MIDIMessageEvent): void => {
		const message = parseMidiMessage(event);
		const {command, channel, note, velocity} = message;
		log('onMidiMessage', command, message);

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
</script>
