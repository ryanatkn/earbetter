<script lang="ts">
	import {onDestroy, onMount} from 'svelte';
	import {isEditable, swallow} from '@feltjs/util/dom.js';
	import {scale, fly} from 'svelte/transition';
	import {plural} from '@feltjs/util/string.js';

	import {
		create_level,
		LevelId,
		LevelStats,
		type Level,
		type LevelData,
	} from '$lib/earbetter/level';
	import Piano from '$lib/music/Piano.svelte';
	import LevelProgressIndicator from '$lib/earbetter/LevelProgressIndicator.svelte';
	import TrialProgressIndicator from '$lib/earbetter/TrialProgressIndicator.svelte';
	import {get_ac} from '$lib/audio/ac';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import type {Midi} from '$lib/music/music';
	import {playing_notes, start_playing, stop_playing} from '$lib/audio/play_note';
	import {get_instrument, get_volume, with_velocity} from '$lib/audio/helpers';
	import {midi_access} from '$lib/audio/midi_access';
	import LevelStatsSummary from '$lib/earbetter/LevelStatsSummary.svelte';
	import TextBurst from '$lib/TextBurst.svelte';

	export let level_data: LevelData; // TODO currently is not reactive, see below
	export let level_stats: LevelStats;
	export let exit_level_to_map: () => void;
	export let register_success: (id: LevelId, mistake_count: number) => void; // TODO naming this param `mistakes` breaks svelte-check, should be fixed in next release

	let clientWidth: number | undefined;

	const ac = get_ac();
	const volume = get_volume();
	const instrument = get_instrument();

	export let level: Level = create_level(level_data, ac, volume, instrument);
	// $: level.setData(level_data); // TODO update if level_data prop changes
	$: ({def, mistakes, status, trial} = level);
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

	let feedback_count = 0;

	let last_feedback_status: null | 'success' | 'failure' = null;
	$: if (success) {
		feedback_count++;
		last_feedback_status = 'success';
		// TODO BLOCK calculate position based on last midi in sequence
	}
	$: if (failure) {
		feedback_count++;
		last_feedback_status = 'failure';
		// TODO BLOCK calculate position based on last midi in sequence
	}

	$: initial = waiting && guessing_index === 0; // the initial user-prompting trial state before any inputs have been entered by the player (related, "prompting")

	$: if (complete) {
		register_success(level_data.id, level.mistakes.peek());
	}

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
						exit_level_to_map();
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
				if (e.ctrlKey) {
					level.win();
				} else {
					level.guess_correctly();
				}
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

<svelte:window on:keydown|capture={keydown} />
<MidiInput
	{midi_access}
	on:note_start={(e) => {
		// TODO should this be ignored if it's not an enabled key? should the level itself ignore the guess?
		if ($status === 'complete') {
			start_playing(ac, e.detail.note, with_velocity($volume, e.detail.velocity), $instrument);
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

	<div class="piano-wrapper" style:padding="{piano_padding}px">
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				note_min={$def.note_min}
				note_max={$def.note_max}
				enabled_notes={$trial?.valid_notes}
				{pressed_keys}
				{highlighted_keys}
				on:press={$status === 'waiting_for_input'
					? (e) => on_press_key(e.detail)
					: $status === 'complete'
					? (e) => start_playing(ac, e.detail, with_velocity($volume, null), $instrument)
					: undefined}
				on:release={$status === 'complete' ? (e) => stop_playing(e.detail) : undefined}
			/>
		{/if}
	</div>

	<div class="feedback" class:success class:failure class:complete>
		{#if complete}
			<div class="completed-level-feedback pane">
				<div class="panel centered padded-md">
					<div class="centered-hz" in:scale={{duration: 3000}}>
						<div class="icons" in:fly|local={{duration: 4000, x: -200}}>🎵</div>
						<div class="icons" in:fly|local={{duration: 4000, x: 200}}>🎶</div>
					</div>
					<div class="panel padded-md centered" in:scale|local={{delay: 250}}>
						<div style:margin-bottom="var(--spacing_xs)">
							{$mistakes} mistake{plural($mistakes)} this run
						</div>
						<LevelStatsSummary {level_data} {level_stats} />
					</div>
					<button class="big" on:click={() => exit_level_to_map()} in:scale|local={{delay: 500}}>
						go back to the map &nbsp;<code>Escape</code></button
					>
					<button class="big" on:click={() => level.reset()} in:scale|local={{delay: 750}}>
						replay level &nbsp;<code>r</code>
					</button>
				</div>
			</div>
		{/if}
		{#if last_feedback_status !== null}
			<div class="feedback-text-bursts">
				{#if last_feedback_status === 'success'}
					{#key feedback_count}
						<TextBurst count={47} items={['🎵', '🎶', '🌸', '🌻', '🌼', '🍀']} />
					{/key}
				{/if}
				{#if last_feedback_status === 'failure'}
					<!-- TODO grayscale? -->
					{#key feedback_count}
						<TextBurst count={47} items={['🦜', '⁉', '❌']} />
					{/key}
				{/if}
			</div>
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
		top: 0;
		left: 0;
		z-index: 2;
		width: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.icons {
		font-size: var(--icon_size_xl);
		word-break: break-all;
		text-align: center;
		word-wrap: break-word;
	}

	.feedback-text-bursts {
		font-size: var(--font_size_xl3);
		position: fixed;
		inset: 0;
		z-index: 5;
		pointer-events: none;
		/* overflow: hidden; */
	}

	.completed-level-feedback {
		margin-top: var(--spacing_lg);
		overflow: hidden;
	}
</style>
