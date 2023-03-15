<script lang="ts">
	import {onMount} from 'svelte';

	import {create_level_store, type LevelDef} from '$lib/earworm/level';
	import Piano from '$lib/music/Piano.svelte';
	import LevelProgressIndicator from '$lib/earworm/LevelProgressIndicator.svelte';
	import TrialProgressIndicator from '$lib/earworm/TrialProgressIndicator.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import type {Midi} from '$lib/music/midi';

	/*

  TODO

	- MIDI input!!
	- orient people to their keyboard, maybe showing middle C?
		- related: consider rendering the Piano clamped to the tonic and octaveShift (valid_notes) - problem is you might have a harder time arranging yourself on your keyboard
		- maybe always show the full keyboard? maybe always start at a C?
	- clamp level def data to the audible range
	- xstate!
	- what about supporting only a negative octave shift? changes the `tonic_max` calculation!
	- consider disabling input except for the tonic at first
  - show a histogram of the correct inputs lined up vertically  with the buttons, moving to the right from the left or fixed onscreen

  */
	export let level_def: LevelDef;
	export let exit_level_to_map: (success?: boolean) => void;

	let clientWidth; // `undefined` on first render

	const audio_ctx = get_audio_ctx();

	const level = create_level_store(level_def, audio_ctx);
	// $: level.setDef(level_def); // TODO update if level_def prop changes

	$: highlighted_keys = $level.trial && new Set([$level.trial.sequence[0]]);
	$: console.log('highlighted', highlighted_keys);

	// emphasize middle C to make it easier to orient oneself on a MIDI keyboard
	const emphasized_keys = new Set([60 as Midi]);

	onMount(() => {
		level.send('START');
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
						exit_level_to_map(true);
						break;
					}
					default: {
						break;
					}
				}
				break;
			}
			case '`': {
				level.guess_correctly($level);
				break;
			}
			case 'Escape': {
				exit_level_to_map(); // TODO confirmation dialog
				break;
			}
		}
	};

	const on_press_key = (note: Midi): void => {
		console.log('press note key', note);
		level.send({type: 'GUESS', note});
	};

	const piano_padding = 20;
</script>

<MidiInput
	on:note_start={(e) => {
		// TODO should this be ignored if it's not an enabled key? should the level itself ignore the guess?
		console.log(`e`, e);
		level.send({type: 'GUESS', note: e.detail.note});
	}}
/>
<div class="level" bind:clientWidth>
	<!-- debugging -->
	<div class="info">
		<div>status: {$level.status}</div>
		<div>trials created: {$level.trials.length}</div>
		{#if $level.trial}
			<div>trial: {$level.trial.index + 1} of {$level.def.trial_count}</div>
			<div>retry_count: {$level.trial.retry_count}</div>
			{#if $level.trial.presenting_index !== null}
				<div>
					presenting_index: {$level.trial.sequence[$level.trial.presenting_index]}
				</div>
			{:else}...{/if}
		{:else}no trial{/if}
	</div>
	<!-- /debugging -->

	<!-- {#if $level.status === 'presenting_prompt'}
	{:else if $level.status === 'waiting_for_input'} -->
	{#if $level.status === 'showing_success_feedback'}
		<div class="feedback success" />
	{:else if $level.status === 'showing_failure_feedback'}
		<div class="feedback failure" />
	{:else if $level.status === 'complete'}
		<button class="feedback complete" on:click={() => exit_level_to_map()}>
			go back to the map
		</button>
	{/if}

	<div class="level-progress">
		<LevelProgressIndicator {level} />
	</div>
	<div class="trial-progress">
		<TrialProgressIndicator {level} />
	</div>

	<div class="piano-wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding}
				midi_min={$level.def.midi_min}
				midi_max={$level.def.midi_max}
				on:press={$level.status === 'waiting_for_input' ? (e) => on_press_key(e.detail) : undefined}
				enabled_keys={$level.trial?.valid_notes}
				{highlighted_keys}
				{emphasized_keys}
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
		height: 50px;
		width: 100%;
	}
	.trial-progress {
		position: absolute;
		right: 0;
		top: 100px;
		height: 50px;
		width: 100%;
	}
	.piano-wrapper {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
	}
	.feedback {
		position: absolute;
		top: 50px;
		right: 0;
		width: 100%;
		height: 50px;
	}
	.feedback.success {
		background-color: green;
	}
	.feedback.failure {
		background-color: red;
	}
	.feedback.complete {
		height: 25px;
		width: auto;
		font-size: var(--font_size_xl2);
	}
</style>
