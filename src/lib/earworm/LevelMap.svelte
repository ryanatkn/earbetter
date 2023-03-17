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
	export let select_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let edit_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let remove_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?
	export let create_level_def: ((level_def: LevelDef) => void) | null = null; // TODO event? or is the ability to have a return value for ephemeral state desired?

	const level_stats = create_level_stats(level_defs);
	$: console.log('stats', $level_stats);
	console.log($level_stats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;
</script>

<div class="map">
	<section class="panel padded-md">
		<h1>levels</h1>
		<div class="levels column-sm">
			{#each level_defs as level_def (level_def.id)}
				<LevelMapItem
					{level_def}
					select={select_level_def}
					edit={edit_level_def}
					remove={remove_level_def}
					completed={$level_stats.completed[level_def.id]}
				/>
			{/each}
		</div>
	</section>
	<section class="panel padded-md markup">
		<InitMidiButton {midi_input} />
		<h2>controls</h2>
		<p><code>Escape</code>: exit level</p>
	</section>
	<section class="panel padded-md markup">
		<LevelDefForm on:create={(e) => create_level_def?.(e.detail)} />
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
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: var(--spacing_xl5) 0;
	}
</style>
