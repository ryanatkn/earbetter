<script lang="ts">
	import {is_editable, swallow} from '@ryanatkn/belt/dom.js';
	import {scale, fly} from 'svelte/transition';
	import {plural} from '@ryanatkn/belt/string.js';
	import {untrack} from 'svelte';

	import {Level_Stats, type Level} from '$lib/earbetter/level.js';
	import Piano from '$lib/Piano.svelte';
	import Level_Progress_Indicator from '$lib/earbetter/Level_Progress_Indicator.svelte';
	import Trial_Progress_Indicator from '$lib/earbetter/Trial_Progress_Indicator.svelte';
	import {get_audio_context} from '$lib/audio_context.js';
	import Midi_Input from '$lib/Midi_Input.svelte';
	import type {Midi} from '$lib/music.js';
	import {playing_notes, start_playing, stop_playing} from '$lib/play_note.js';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers.js';
	import {midi_access} from '$lib/midi_access.js';
	import Level_Stats_Summary from '$lib/earbetter/Level_Stats_Summary.svelte';
	import Text_Burst from '$lib/Text_Burst.svelte';

	interface Props {
		level: Level;
		level_stats: Level_Stats;
		exit_level: () => void;
	}

	const {level, level_stats, exit_level}: Props = $props();

	const ac = get_audio_context();
	const volume = get_volume();
	const instrument = get_instrument();

	let clientWidth: number | undefined = $state();

	const {level_data, mistakes, status, trial, last_guess} = $derived(level);
	const guessing_index = $derived($trial?.guessing_index);

	const pressed_keys = $derived($status === 'presenting_prompt' ? null : $playing_notes);
	const highlighted_keys = $derived($trial && new Set([$trial.sequence[0]]));

	$effect(() => {
		level.start(); // TODO problem here is the audio context needs to be resumed, so if it's not ready maybe have a start button
	});

	const on_press_key = (note: Midi): void => {
		console.log('press note key', note);
		level.guess(note);
	};

	let feedback_count = $state(0);

	let last_feedback_status: null | 'success' | 'failure' = $state(null);

	const waiting = $derived($status === 'waiting_for_input');
	const success = $derived($status === 'showing_success_feedback');
	const failure = $derived($status === 'showing_failure_feedback');
	const complete = $derived($status === 'complete');

	// TODO better way to do these? callback to `level`?
	$effect(() => {
		if (success) untrack(update_success);
	});
	$effect(() => {
		if (failure) untrack(update_failure);
	});
	const update_success = () => {
		feedback_count++;
		last_feedback_status = 'success';
		update_text_burst_position();
	};
	const update_failure = () => {
		feedback_count++;
		last_feedback_status = 'failure';
		update_text_burst_position();
	};

	let piano_wrapper_el: HTMLElement | undefined = $state();
	let text_burst_offset_x = $state(0);
	let text_burst_offset_y = $state(0);
	const update_text_burst_position = () => {
		if (!piano_wrapper_el) return;
		const guessed = $last_guess;
		if (guessed === null) return;
		const note_el = piano_wrapper_el.querySelector(`[data-note="${guessed}"]`);
		if (!note_el) return;
		const rect = note_el.getBoundingClientRect();
		text_burst_offset_x = rect.x;
		text_burst_offset_y = rect.y + rect.height / 2;
	};

	const initial = $derived(waiting && guessing_index === 0); // the initial user-prompting trial state before any inputs have been entered by the player (related, "prompting")

	const piano_padding = 20;

	let el: HTMLElement | undefined = $state();

	const click = (e: MouseEvent) => {
		if (e.target === el) {
			swallow(e);
			level.retry_trial();
		}
	};
	const keydown = (e: KeyboardEvent) => {
		if (is_editable(e.target) || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
			return;
		}
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
						exit_level();
						return;
					}
					default: {
						swallow(e);
						level.retry_trial();
						return;
					}
				}
			}
			case 'd': {
				swallow(e);
				level.guess_correctly();
				return;
			}
			case 'a': {
				swallow(e);
				level.guess_incorrectly();
				return;
			}
			case 'w': {
				swallow(e);
				level.win();
				return;
			}
		}
	};
</script>

<svelte:window onkeydowncapture={keydown} />
<Midi_Input
	{midi_access}
	onnotestart={(note, velocity) => {
		// TODO should this be ignored if it's not an enabled key? should the level itself ignore the guess?
		if ($status === 'complete') {
			start_playing(ac(), note, with_velocity($volume, velocity), $instrument);
		} else {
			console.log(`guessing $status`, $status);
			// TODO should we intercept here if disabled, and just play the blip with no penalty? or should that be a param to `guess`?
			level.guess(note);
		}
	}}
	onnotestop={(note) => {
		stop_playing(note);
	}}
/>
<!-- hide from screen readers, see keyboard commands -->
<div class="level" class:initial bind:clientWidth onclick={click} bind:this={el} aria-hidden="true">
	<div class="level_progress" title="level progress">
		<Level_Progress_Indicator {level} />
	</div>
	<div class="trial_progress" title="trial progress">
		<Trial_Progress_Indicator {level} />
	</div>
	<div class="piano_wrapper" style:padding="{piano_padding}px" bind:this={piano_wrapper_el}>
		{#if clientWidth}
			<Piano
				width={clientWidth - piano_padding * 2}
				min_note={level_data.min_note}
				max_note={level_data.max_note}
				enabled_notes={$trial?.valid_notes}
				{pressed_keys}
				{highlighted_keys}
				onpress={$status === 'waiting_for_input'
					? (note) => on_press_key(note)
					: $status === 'complete'
						? (note) => start_playing(ac(), note, with_velocity($volume, null), $instrument)
						: undefined}
				onrelease={$status === 'complete' ? (note) => stop_playing(note) : undefined}
			/>
		{/if}
	</div>
	<div class="feedback" class:success class:failure class:complete>
		{#if complete}
			<div class="completed_level_feedback">
				<div class="pane shadow_d_xl p_xl3 pt_0 box" transition:scale>
					<div class="box row" in:scale={{duration: 3000}}>
						<div class="completed_header_icon" in:fly={{duration: 4000, x: -200}}>♫</div>
						<div class="completed_header_icon" in:fly={{duration: 4000, x: 200}}>♩<sup>♪</sup></div>
					</div>
					<!-- TODO buggy in Svelte 5 -   -->
					<div class="panel p_md mb_md box w_100">
						<div class="panel p_md mb_md box">
							{#if $mistakes === 0}
								<div class="size_xl3 text_align_center">flawless run!</div>
							{:else}
								<div class="size_xl3">
									{$mistakes}
								</div>
								<div>
									mistake{plural($mistakes)} this run
								</div>
							{/if}
						</div>
						<div class="panel p_md">
							<Level_Stats_Summary {level_data} {level_stats} />
						</div>
					</div>
					<!-- TODO buggy in Svelte 5 - in:scale={{delay: 500}} -->
					<button class="big mb_md" onclick={() => exit_level()}>
						go back to the map &nbsp;<code>Space</code></button
					>
					<!-- TODO buggy in Svelte 5 - in:scale={{delay: 750}} -->
					<button class="big" onclick={() => level.reset()}>
						replay level &nbsp;<code>r</code>
					</button>
				</div>
			</div>
		{/if}
		{#if last_feedback_status !== null}
			<div class="feedback_text_bursts">
				<div style:transform="translate3d({text_burst_offset_x}px, {text_burst_offset_y}px, 0)">
					{#if last_feedback_status === 'success'}
						{#key feedback_count}
							<Text_Burst count={11} items={['🎵', '🎶', '🌸', '🌻', '🌼', '🍀']} />
						{/key}
					{/if}
					{#if last_feedback_status === 'failure'}
						<!-- TODO grayscale? -->
						{#key feedback_count}
							<Text_Burst count={5} items={['🦜', '⁉', '❔', '❌']} />
						{/key}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.level {
		--level_progress_height: 50px;
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
		font-size: var(--size_xl);
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
	.level_progress {
		position: absolute;
		right: 0;
		bottom: 0;
		height: var(--level_progress_height);
		width: 100%;
	}
	.trial_progress {
		position: absolute;
		right: 0;
		top: 0;
		height: var(--level_progress_height);
		width: 100%;
	}
	.piano_wrapper {
		position: relative;
		z-index: 1;
		width: 100%;
	}

	.completed_header_icon {
		font-size: var(--icon_size_xl);
		word-break: break-all;
		text-align: center;
		word-wrap: break-word;
		padding: var(--space_xs);
	}
	@media (max-width: 500px) {
		.completed_header_icon {
			font-size: var(--icon_size_lg);
		}
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
		pointer-events: none;
	}
	.feedback_text_bursts {
		font-size: var(--size_xl3);
		position: fixed;
		inset: 0;
		z-index: 115;
		pointer-events: none;
		/* overflow: hidden; */
	}
	.completed_level_feedback {
		padding-top: var(--level_progress_height);
		pointer-events: initial;
	}
	.completed_level_feedback .pane {
		overflow: hidden;
	}
</style>
