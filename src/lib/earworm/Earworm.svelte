<script lang="ts">
	import {levelDefs} from '$lib/earworm/levelDefs';
	import type {LevelDef} from '$lib/earworm/level';
	import {createLevelStats} from '$lib/earworm/levelStats';
	import Level from '$lib/earworm/Level.svelte';
	import MapLevelIcon from '$lib/earworm/MapLevelIcon.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';

	console.log('levelDefs', levelDefs);

	let activeLevelDef: LevelDef | null = null; // TODO initialize to undefined

	const levelStats = createLevelStats(levelDefs);
	$: console.log('stats', $levelStats);
	console.log($levelStats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;

	let midi_input: MidiInput;

	const selectLevelDef = (levelDef: LevelDef): void => {
		void audio_ctx.resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `selectLevelDef` is called without a user action
		activeLevelDef = levelDef;
	};

	const exitLevelToMap = (success = false): void => {
		if (!activeLevelDef) return;
		if (success) {
			levelStats.registerSuccess(activeLevelDef.id);
		}
		activeLevelDef = null;
	};
</script>

<MidiInput bind:this={midi_input} />
<div class="earworm">
	{#if activeLevelDef}
		<Level levelDef={activeLevelDef} {exitLevelToMap} />
	{:else}
		<div>
			{#each levelDefs as levelDef}
				<MapLevelIcon
					{levelDef}
					select={selectLevelDef}
					completed={$levelStats.completed[levelDef.id]}
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
