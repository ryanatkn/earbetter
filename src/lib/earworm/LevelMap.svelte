<script lang="ts">
	import type {LevelDef} from '$lib/earworm/level';
	import {create_level_stats} from '$lib/earworm/level_stats';
	import LevelMapItem from '$lib/earworm/LevelMapItem.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import type MidiInput from '$lib/audio/MidiInput.svelte';
	import InitMidiButton from '$lib/music/InitMidiButton.svelte';
	import LevelDefForm from '$lib/earworm/LevelDefForm.svelte';

	export let midi_input: MidiInput;
	export let level_defs: LevelDef[];
	export let select_level_def: (level_def: LevelDef) => void; // TODO event?
	export let create_level_def: (level_def: LevelDef) => void; // TODO event?

	const level_stats = create_level_stats(level_defs);
	$: console.log('stats', $level_stats);
	console.log($level_stats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;
</script>

<div class="map">
	<h1>levels</h1>
	<div class="levels">
		{#each level_defs as level_def}
			<LevelMapItem
				{level_def}
				select={select_level_def}
				completed={$level_stats.completed[level_def.id]}
			/>
		{/each}
	</div>
	<InitMidiButton {midi_input} />
	<section class="panel padded-md">
		<LevelDefForm on:save={(e) => create_level_def(e.detail)} />
	</section>
</div>

<style>
	.map {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		padding: var(--spacing_md);
	}
	section {
		margin: var(--spacing_xl5) 0;
	}
</style>
