<script lang="ts">
	import PianoKey from '$lib/music/PianoKey.svelte';
	import {MIDI_MIN, MIDI_MAX, type Midi} from '$lib/music/midi';
	import {compute_piano_keys} from '$lib/music/piano';

	export let width: number;
	export let midi_min: Midi = MIDI_MIN;
	export let midi_max: Midi = MIDI_MAX;
	export let enabled_keys: Set<Midi> | null = null;
	export let highlighted_keys: Set<Midi> | null = null;
	export let emphasized_keys: Set<Midi> | null = null;

	const is_key_enabled = (key: Midi, enabled_keys: Set<Midi> | null): boolean =>
		!enabled_keys || enabled_keys.has(key);

	const is_key_highlighted = (key: Midi, highlighted_keys: Set<Midi> | null): boolean =>
		!!highlighted_keys?.has(key);

	const is_key_emphasized = (key: Midi, emphasized_keys: Set<Midi> | null): boolean =>
		!!emphasized_keys?.has(key);

	$: ({piano_keys, natural_key_height} = compute_piano_keys(width, midi_min, midi_max));
</script>

<div class="piano" style:width="{width}px">
	<div class="piano-keys" style:height="{natural_key_height}px">
		{#each piano_keys as key (key.midi)}
			<PianoKey
				on:press
				on:release
				midi={key.midi}
				left_offset={key.left_offset}
				width={key.width}
				height={key.height}
				enabled={is_key_enabled(key.midi, enabled_keys)}
				highlighted={is_key_highlighted(key.midi, highlighted_keys)}
				emphasized={is_key_emphasized(key.midi, emphasized_keys)}
			/>
		{/each}
	</div>
</div>

<style>
	.piano {
		position: relative;
	}
</style>
