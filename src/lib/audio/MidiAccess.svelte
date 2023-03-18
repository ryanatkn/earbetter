<script lang="ts" context="module">
	let global_midi_access: MIDIAccess | null = null;
	let inited: Promise<void> | undefined;
</script>

<script lang="ts" accessors>
	import {writable, type Writable} from 'svelte/store';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import {request_midi_access} from '$lib/audio/midi_helpers';

	export const ma: Writable<MIDIAccess | null> = writable(global_midi_access);

	export const init = async (): Promise<void> => {
		if (inited) return inited;
		inited = Promise.resolve();
		if (global_midi_access) {
			$ma = global_midi_access;
			return inited;
		}
		// TODO how to call this better? needs to be a user-initiated action right?
		// do we need to present a screen to users that lets them opt into midi?
		try {
			$ma = global_midi_access = await request_midi_access();
			console.log('requested midi_access', $ma);
			if (!$ma) {
				throw Error(`Cannot list midi inputs without access`);
			}
		} catch (err) {
			console.error('loadMidiAccess failed', err);
			alert('Failed to request MIDI access: ' + err.message); // eslint-disable-line no-alert
			// TODO resolve a failure value?
		}
		return inited;
	};
</script>
