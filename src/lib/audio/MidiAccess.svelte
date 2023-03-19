<script lang="ts" context="module">
	let global_midi_access: MIDIAccess | null = null;
	let inited: Promise<void> | undefined;
</script>

<script lang="ts" accessors>
	import {writable, type Writable} from 'svelte/store';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import {request_midi_access} from '$lib/audio/midi_helpers';

	export const ma: Writable<MIDIAccess | null> = writable(global_midi_access);

	/**
	 * `init` is idempotent so components don't have to worry about colliding with each other.
	 */
	export const request_access = async (): Promise<void> => {
		if (inited) return inited;
		let resolve!: () => void;
		inited = new Promise((r) => (resolve = r));
		try {
			$ma = global_midi_access = await request_midi_access();
			console.log('requested midi_access', $ma);
		} catch (err) {
			console.error('loadMidiAccess failed', err);
			alert('Failed to request MIDI access: ' + err.message); // eslint-disable-line no-alert
		}
		resolve();
		return inited;
	};
</script>
