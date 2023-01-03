<script lang="ts">
	import {onMount} from 'svelte';

	import {createLevelStore, type LevelDef} from '$lib/earworm/level';
	import Piano from '$lib/music/Piano.svelte';
	import LevelProgressIndicator from '$lib/earworm/LevelProgressIndicator.svelte';
	import TrialProgressIndicator from '$lib/earworm/TrialProgressIndicator.svelte';
	import {getAudioCtx} from '$lib/audio/audioCtx';
	import {getMidiInput} from '$lib/audio/midiInput';
	import type {Midi} from '$lib/music/midi';

	/*

  TODO

	- MIDI input!!
	- orient people to their keyboard, maybe showing middle C?
		- related: consider rendering the Piano clamped to the tonic and octaveShift (validNotes) - problem is you might have a harder time arranging yourself on your keyboard
		- maybe always show the full keyboard? maybe always start at a C?
	- clamp level def data to the audible range
	- xstate!
	- what about supporting only a negative octave shift? changes the `tonicMax` calculation!
	- consider disabling input except for the tonic at first
  - show a histogram of the correct inputs lined up vertically  with the buttons, moving to the right from the left or fixed onscreen

  */
	export let levelDef: LevelDef;
	export let exitLevelToMap: (success?: boolean) => void;

	let clientWidth; // `undefined` on first render

	const audioCtx = getAudioCtx();

	const level = createLevelStore(levelDef, audioCtx);
	// $: level.setDef(levelDef); // TODO update if levelDef prop changes

	$: highlightedKeys = $level.trial && new Set([$level.trial.sequence[0]]);
	$: console.log('highlighted', highlightedKeys);

	// emphasize middle C to make it easier to orient oneself on a MIDI keyboard
	const emphasizedKeys = new Set([60 as Midi]);

	onMount(() => {
		level.send('START');
	});

	getMidiInput({
		onNoteStart: (midi) => {
			// TODO should this be ignored if it's not an enabled key? should the level itself ignore the guess?
			level.send({type: 'GUESS', midi});
		},
	});

	const reset = () => level.reset();

	const onDocumentKeyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case 'r': {
				reset();
				break;
			}
			case ' ': {
				switch ($level.status) {
					case 'complete': {
						exitLevelToMap(true);
						break;
					}
					default: {
						break;
					}
				}
				break;
			}
			case '`': {
				level.guessCorrectly($level);
				break;
			}
			case 'Escape': {
				exitLevelToMap(); // TODO confirmation dialog
				break;
			}
		}
	};

	const onPressKey = (midi: Midi): void => {
		console.log('press midi key', midi);
		level.send({type: 'GUESS', midi});
	};
</script>

<div class="level" bind:clientWidth>
	<!-- debugging -->
	<div class="info">
		<div>status: {$level.status}</div>
		<div>trials created: {$level.trials.length}</div>
		{#if $level.trial}
			<div>trial: {$level.trial.index + 1} of {$level.def.trialCount}</div>
			<div>retryCount: {$level.trial.retryCount}</div>
			{#if $level.trial.presentingIndex !== null}
				<div>
					presentingIndex: {$level.trial.sequence[$level.trial.presentingIndex]}
				</div>
			{:else}...{/if}
		{:else}no trial{/if}
	</div>
	<!-- /debugging -->

	<!-- {#if $level.status === 'presentingPrompt'}
	{:else if $level.status === 'waitingForInput'} -->
	{#if $level.status === 'showingSuccessFeedback'}
		<div class="feedback success" />
	{:else if $level.status === 'showingFailureFeedback'}
		<div class="feedback failure" />
	{:else if $level.status === 'complete'}
		<button class="feedback complete" on:click={() => exitLevelToMap()}>
			return to the galaxy map
		</button>
	{/if}

	<div class="level-progress">
		<LevelProgressIndicator {level} />
	</div>
	<div class="trial-progress">
		<TrialProgressIndicator {level} />
	</div>

	<div class="piano-wrapper">
		{#if clientWidth}
			<Piano
				width={clientWidth}
				midiMin={$level.def.midiMin}
				midiMax={$level.def.midiMax}
				on:press={$level.status === 'waitingForInput' ? (e) => onPressKey(e.detail) : undefined}
				enabledKeys={$level.trial?.validNotes}
				{highlightedKeys}
				{emphasizedKeys}
			/>
		{/if}
	</div>
</div>

<svelte:window on:keydown={onDocumentKeyDown} />

<style>
	.level {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		color: var(--color_active);
	}
	.info {
		font-size: var(--font_size_xl);
		height: 100%;
		width: 100%;
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}
	.level-progress {
		position: absolute;
		right: 0;
		top: 0;
		height: 50%;
		width: 50%;
	}
	.trial-progress {
		position: absolute;
		right: 0;
		top: 100%;
		height: 50%;
		width: 80%;
	}
	.piano-wrapper {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
	}
	.feedback {
		position: absolute;
		top: 50%;
		right: 0;
		width: 50%;
		height: 50%;
	}
	.feedback.success {
		background-color: green;
	}
	.feedback.failure {
		background-color: red;
	}
	.feedback.complete {
		height: 25%;
		font-size: var(--font_size_xl2);
	}
</style>
