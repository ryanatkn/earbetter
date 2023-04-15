<script lang="ts">
	import {z} from 'zod';
	import {effect, signal} from '@preact/signals-core';

	import Footer from '$routes/Footer.svelte';
	import {Midi} from '$lib/music/music';
	import {load_from_storage, set_in_storage} from '$lib/util/storage';
	import Sequencer from '$lib/sequencer/Sequencer.svelte';

	// TODO extract? is pretty specific
	const PianoSettings = z.object({
		note_min: Midi.default(36),
		note_max: Midi.default(96),
	});
	type PianoSettings = z.infer<typeof PianoSettings>;
	const SITE_DATA_STORAGE_KEY = 'piano';
	const initial_piano_settings = load_from_storage(
		SITE_DATA_STORAGE_KEY,
		() => PianoSettings.parse({}),
		PianoSettings.parse,
	);

	const note_min = signal(initial_piano_settings.note_min);
	const note_max = signal(initial_piano_settings.note_max);

	const to_piano_data = (): PianoSettings => ({
		note_min: note_min.value,
		note_max: note_max.value,
	});
	const save_piano_data = () => set_in_storage(SITE_DATA_STORAGE_KEY, to_piano_data());
	effect(save_piano_data);
</script>

<svelte:head>
	<title>Earbetter: sequencer</title>
</svelte:head>

<main>
	<Sequencer />
	<Footer />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
