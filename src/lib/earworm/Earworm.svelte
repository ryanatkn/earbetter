<script lang="ts">
	import {level_defs} from '$lib/earworm/level_defs';
	import type {LevelDef} from '$lib/earworm/level';
	import {createLevelStats} from '$lib/earworm/level_stats';
	import Level from '$lib/earworm/Level.svelte';
	import MapLevelIcon from '$lib/earworm/MapLevelIcon.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';

	console.log('level_defs', level_defs);

	let activeLevelDef: LevelDef | null = null; // TODO initialize to undefined

	const level_stats = createLevelStats(level_defs);
	$: console.log('stats', $level_stats);
	console.log($level_stats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;

	let midi_input: MidiInput;

	const selectLevelDef = (level_def: LevelDef): void => {
		void audio_ctx.resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `selectLevelDef` is called without a user action
		activeLevelDef = level_def;
	};

	const exitLevelToMap = (success = false): void => {
		if (!activeLevelDef) return;
		if (success) {
			level_stats.register_success(activeLevelDef.id);
		}
		activeLevelDef = null;
	};
</script>

<MidiInput bind:this={midi_input} />
<div class="earworm">
	{#if activeLevelDef}
		<Level level_def={activeLevelDef} {exitLevelToMap} />
	{:else}
		<div>
			{#each level_defs as level_def}
				<MapLevelIcon
					{level_def}
					select={selectLevelDef}
					completed={$level_stats.completed[level_def.id]}
				/>
			{/each}
		</div>
		<button on:click={() => void midi_input.init()}>init MIDI</button>
	{/if}
</div>

<style>
	.earworm {
		width: 100%;
		height: 100%;
	}

	button {
		position: absolute;
		left: 0;
		top: 0;
	}
</style>
