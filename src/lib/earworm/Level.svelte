<script lang="ts">
	import {onDestroy, onMount} from 'svelte';
	import {isEditable, swallow} from '@feltjs/util/dom.js';

	import {create_level, type LevelDef} from '$lib/earbetter/level';
	import Piano from '$lib/music/Piano.svelte';
	import LevelProgressIndicator from '$lib/earbetter/LevelProgressIndicator.svelte';
	import TrialProgressIndicator from '$lib/earbetter/TrialProgressIndicator.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import type {Midi} from '$lib/music/midi';
	import {playing_notes, start_playing, stop_playing} from '$lib/audio/play_note';
	import {get_volume} from '$lib/audio/helpers';
	import {midi_access} from '$lib/audio/midi_access';

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
	const volume = get_volume();

	const level = create_level(level_def, audio_ctx, volume);
	// $: level.setDef(level_def); // TODO update if level_def prop changes
	$: ({def, status, trial} = level);
	$: guessing_index = $trial?.guessing_index;

	$: pressed_keys = $status === 'presenting_prompt' ? null : $playing_notes;
	$: highlighted_keys = $trial && new Set([$trial.sequence[0]]);

	onMount(() => {
		level.start();
	});
	onDestroy(() => {
		level.dispose();
	});

	const on_press_key = (note: Midi): void => {
		console.log('press note key', note);
		level.guess(note);
	};

	let success: boolean; // TODO why is this needed? appears to be a bug in the Svelte language tools
	$: success = $status === 'showing_success_feedback';
	$: failure = $status === 'showing_failure_feedback';
	$: complete = $status === 'complete';
	$: waiting = $status === 'waiting_for_input';

	$: initial = waiting && guessing_index === 0; // the initial user-prompting trial state before any inputs have been entered by the player (related, "prompting")

	const piano_padding = 20;

	let el: HTMLElement;

	const click = (e: MouseEvent) => {
		if (e.target === el) {
			swallow(e);
			level.retry_trial();
		}
	};
	const keydown = (e: KeyboardEvent) => {
		if (isEditable(e.target)) return;
		switch (e.key) {
			case 'r': {
				swallow(e);
				level.reset();
				return;
			}
			case ' ': {
				switch ($status) {
					case 'complete': {
						swallow(e);
						exit_level_to_map(true);
						return;
					}
					default: {
						swallow(e);
						level.retry_trial();
						return;
					}
				}
			}
			case '`': {
				swallow(e);
				level.guess_correctly();
				return;
			}
			case 'Escape': {
				swallow(e);
				exit_level_to_map(); // TODO confirmation dialog
				return;
			}
		}
	};
</script>

<svelte:window on:keydown={keydown} />
<MidiInput
	{midi_access}
	on:note_start={(e) => {
		// TODO should this be ignored if it's not an enabled key? should the level itself ignore the guess?
		if ($status === 'complete') {
			start_playing(audio_ctx, e.detail.note, $volume);
		} else {
			console.log(`guessing $status`, $status);
			// TODO should we intercept here if disabled, and just play the blip with no penalty? or should that be a param to `guess`?
			level.guess(e.detail.note);
		}
	}}
	on:note_stop={(e) => {
		stop_playing(e.detail.note);
	}}
/>
<!-- hide from screen readers, see keyboard commands -->
<div
	class="level"
	class:initial
	bind:clientWidth
	on:click={click}
	bind:this={el}
	aria-hidden="true"
>
	<!-- <div class="debug">
		<div>status: {status}</div>
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
	</div> -->

	<!-- {#if status === 'presenting_prompt'}
	{:else if status === 'waiting_for_input'} -->

	<div class="level-progress" title="level progress">
		<LevelProgressIndicator {level} />
	</div>
	<div class="trial-progress" title="trial progress">
		<TrialProgressIndicator {level} />
	</div>

	<div class="feedback" class:success class:failure class:complete>
		{#if complete}
			<button class="big" on:click={() => exit_level_to_map()}>
				go back to the map &nbsp;<code>Escape</code></button
			>
			<button class="big" on:click={() => level.reset()}>
				replay level &nbsp;<code>r</code>
			</button>
		{/if}
	</div>

	<div class="piano-wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				note_min={$def.note_min}
				note_max={$def.note_max}
				enabled_keys={$trial?.valid_notes}
				{pressed_keys}
				{highlighted_keys}
				on:press={$status === 'waiting_for_input'
					? (e) => on_press_key(e.detail)
					: $status === 'complete'
					? (e) => start_playing(audio_ctx, e.detail, $volume)
					: undefined}
				on:release={$status === 'complete' ? (e) => stop_playing(e.detail) : undefined}
			/>
		{/if}
	</div>
</div>

<style>
	.level {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		color: var(--color_active);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.initial {
		--highlighted_animation: highlighting;
	}
	/* .debug {
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
	} */
	.level-progress {
		position: absolute;
		right: 0;
		bottom: 0;
		height: 50px;
		width: 100%;
	}
	.trial-progress {
		position: absolute;
		right: 0;
		top: 0;
		height: 50px;
		width: 100%;
	}
	.piano-wrapper {
		width: 100%;
	}
	.feedback {
		position: absolute;
		top: 50px;
		min-height: 50px;
		right: 0;
		width: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.feedback.success {
		background-color: var(--success_color, green);
	}
	.feedback.failure {
		background-color: var(--failure_color, red);
	}
</style>
