<script lang="ts">
	import {levelDefs} from '$lib/earworm/levelDefs';
	import type {LevelDef} from '$lib/earworm/level';
	import {createLevelStats} from '$lib/earworm/levelStats';
	import Level from '$lib/earworm/Level.svelte';
	import MapLevelIcon from '$lib/earworm/MapLevelIcon.svelte';
	import {getAudioCtx} from '$lib/audio/audioCtx';
	import {provideMidiInput} from '$lib/audio/midiInput';

	console.log('levelDefs', levelDefs);

	let activeLevelDef: LevelDef | null = null; // TODO initialize to undefined

	const levelStats = createLevelStats(levelDefs);
	$: console.log('stats', $levelStats);
	console.log($levelStats);

	const audioCtx = getAudioCtx();
	(window as any).audio = audioCtx;

	const selectLevelDef = (levelDef: LevelDef): void => {
		void audioCtx.resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `selectLevelDef` is called without a user action
		activeLevelDef = levelDef;
	};

	const exitLevelToMap = (success = false): void => {
		if (success) {
			levelStats.registerSuccess(activeLevelDef.id);
		}
		// TODO do we actually want to replace this with a statechart?
		// so the active level is a nested machine?
		activeLevelDef = null;
	};

	const midiAccess = provideMidiInput();

	const initMidi = async (): Promise<void> => {
		// TODO how to call this better? needs to be a user-initiated action right?
		// do we need to present a screen to users that lets them opt into midi?
		try {
			await midiAccess.requestMidiAccess();
			midiAccess.initInputs();
		} catch (err) {
			console.log('failed to request MIDI access', err);
			alert('failed to request MIDI access: ' + err.message); // eslint-disable-line no-alert
		}
		console.log('MIDI ready!');
	};
</script>

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
		<button on:click={initMidi}>init MIDI</button>
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
