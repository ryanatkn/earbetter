import {setContext, getContext, onMount, onDestroy} from 'svelte';

import {type MIDIAccess, type MIDIMessageEvent, MIDICommand} from '$lib/audio/WebMIDI';
import {requestMidiAccess, parseMidiMessage} from '$lib/audio/midiHelpers';
import type {Midi} from '$lib/music/midi';

export const midiInputKey = {};
export const getMidiInput = (events: MidiInputEvents): MidiInput => {
	const midiInput: MidiInput = getContext(midiInputKey);

	// TODO improve this code - event emitter? something else?
	// currently it allows only 1 of each event to be registered.
	onMount(() => {
		for (const eventName in events) {
			if ((midiInput.events as any)[eventName]) {
				throw Error(`midi event already registered: ${eventName}`);
			}
			(midiInput.events as any)[eventName] = (events as any)[eventName];
		}
	});
	onDestroy(() => {
		for (const eventName in events) {
			if ((midiInput.events as any)[eventName] !== (events as any)[eventName]) {
				throw Error(`midi event is not registered: ${eventName}`);
			}
			(midiInput.events as any)[eventName] = undefined;
		}
	});

	return midiInput;
};
export const provideMidiInput = (): MidiInput => setContext(midiInputKey, new MidiInput({}));

// const log = logger('MidiInput');
const log = console.log.bind(console);

// TODO set up dev env with https
// for now we use this flag in Chrome to get around the MIDI https restrictions:
// chrome://flags/#unsafely-treat-insecure-origin-as-secure

// TODO do this differently? EventEmitter?
export interface MidiInputEvents {
	onNoteStart?: (midi: Midi, velocity: number) => void;
	onNoteStop?: (midi: Midi, velocity: number) => void;
	onPadStart?: (midi: Midi, velocity: number) => void;
	onPadStop?: (midi: Midi, velocity: number) => void;
	onModWheel?: (velocity: number) => void;
}

export class MidiInput {
	midiAccess: MIDIAccess | null = null;

	constructor(public readonly events: MidiInputEvents) {}

	// TODO dispose and clear `events` and `onmidimesssage` handlers?

	async requestMidiAccess(): Promise<void> {
		this.midiAccess = await requestMidiAccess();
		console.log('midiAccess', this.midiAccess);
	}

	async init(): Promise<void> {
		// TODO how to call this better? needs to be a user-initiated action right?
		// do we need to present a screen to users that lets them opt into midi?
		try {
			await this.requestMidiAccess();
			this.initInputs();
			console.log('MIDI ready!');
		} catch (err) {
			console.error('requestMidiAccess failed', err);
			alert('Failed to request MIDI access: ' + err.message); // eslint-disable-line no-alert
		}
	}

	initInputs(): void {
		if (!this.midiAccess) {
			throw Error(`Cannot list midi inputs without access`);
		}
		for (const input of this.midiAccess.inputs.values()) {
			log('midi input', input);
			input.onmidimessage = this.onMidiMessage;
		}
	}

	onMidiMessage = (event: MIDIMessageEvent): void => {
		const message = parseMidiMessage(event);
		const {command, channel, note, velocity} = message;
		log('onMidiMessage', command, message);

		switch (command) {
			case MIDICommand.Stop: {
				if (channel === 0) {
					this.onNoteStop(note, velocity);
				} else if (channel === 9) {
					this.onPadStop(note, velocity);
				} else {
					log('unknown MIDI stop command', message);
				}
				break;
			}
			case MIDICommand.Start: {
				if (channel === 0) {
					this.onNoteStart(note, velocity);
				} else if (channel === 9) {
					this.onPadStart(note, velocity);
				} else {
					log('unknown MIDI start command', message);
				}
				break;
			}
			case MIDICommand.Knob: {
				if (note === 1) {
					this.onModWheel(velocity);
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

	onNoteStart(midi: Midi, velocity: number): void {
		if (velocity === 0) {
			// this is weird but seems to be correct
			this.onNoteStop(midi, velocity);
		} else {
			if (this.events.onNoteStart) this.events.onNoteStart(midi, velocity);
		}
	}
	onNoteStop(midi: Midi, velocity: number): void {
		if (this.events.onNoteStop) this.events.onNoteStop(midi, velocity);
	}
	onPadStart(midi: Midi, velocity: number): void {
		if (velocity === 0) {
			// this is weird but seems to be correct
			this.onPadStop(midi, velocity);
		} else {
			if (this.events.onPadStart) this.events.onPadStart(midi, velocity);
		}
	}
	onPadStop(midi: Midi, velocity: number): void {
		if (this.events.onPadStop) this.events.onPadStop(midi, velocity);
	}
	onModWheel(velocity: number): void {
		if (this.events.onModWheel) this.events.onModWheel(velocity);
	}
}
