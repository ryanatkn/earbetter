<script lang="ts">
	import { is_editable, swallow } from '@fuzdev/fuz_util/dom.ts';
	import { scale, fly } from 'svelte/transition';
	import { plural } from '@fuzdev/fuz_util/string.ts';
	import { onMount } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	import { LevelStats, type Level } from './level.svelte.ts';
	import Piano from '../Piano.svelte';
	import LevelProgressIndicator from './LevelProgressIndicator.svelte';
	import TrialProgressIndicator from './TrialProgressIndicator.svelte';
	import MidiInput from '../MidiInput.svelte';
	import type { Midi } from '../music.ts';
	import LevelStatsSummary from './LevelStatsSummary.svelte';
	import TextBurst from '../TextBurst.svelte';
	import { app_context } from './app.svelte.ts';

	interface Props {
		level: Level;
		level_stats: LevelStats;
		exit_level: () => void;
	}

	const { level, level_stats, exit_level }: Props = $props();

	const app = app_context.get();

	// TODO `level_data` is not reactive, so we can destructure, but should we?
	const { level_data } = $derived(level);
	const guessing_index = $derived(level.trial?.guessing_index);

	const pressed_keys = $derived(level.status === 'presenting_prompt' ? null : app.playing_notes);
	const highlighted_keys = $derived(level.trial && new Set([level.trial.sequence[0]!]));

	// the parent keys this component on `level`, so each level starts on mount
	onMount(() => {
		level.start(); // TODO problem here is the audio context needs to be resumed, so if it's not ready maybe have a start button
	});

	const on_press_key = (note: Midi): void => {
		level.guess(note);
	};

	const waiting = $derived(level.status === 'waiting_for_input');
	const success = $derived(level.status === 'showing_success_feedback');
	const failure = $derived(level.status === 'showing_failure_feedback');
	const complete = $derived(level.status === 'complete');

	let piano_wrapper_el: HTMLElement | undefined = $state();

	/**
	 * Positions a feedback burst at the piano key that was guessed.
	 * Each burst is keyed on its `Level.feedback` and mounts fresh, so this measures once per guess.
	 */
	const place_at_note =
		(note: Midi): Attachment<HTMLElement> =>
		(el) => {
			const note_el = piano_wrapper_el?.querySelector(`[data-note="${note}"]`);
			if (!note_el) return;
			const rect = note_el.getBoundingClientRect();
			el.style.transform = `translate3d(${rect.x}px, ${rect.y + rect.height / 2}px, 0)`;
		};

	const initial = $derived(waiting && guessing_index === 0); // the initial user-prompting trial state before any inputs have been entered by the player (related, "prompting")

	const piano_padding = 20;

	const click = (e: MouseEvent) => {
		if (e.target === e.currentTarget) {
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
				switch (level.status) {
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
<MidiInput
	inputs={app.midi_inputs}
	onnotestart={(note, velocity) => {
		// TODO should this be ignored if it's not an enabled key? should the level itself ignore the guess?
		if (level.status === 'complete') {
			app.start_note(note, velocity);
		} else {
			level.guess(note);
		}
	}}
	onnotestop={app.stop_note}
/>
<!-- hide from screen readers, see keyboard commands -->
<div class="level" class:initial onclick={click} aria-hidden="true">
	<div class="level_progress" title="level progress">
		<LevelProgressIndicator {level} />
	</div>
	<div class="trial_progress" title="trial progress">
		<TrialProgressIndicator {level} />
	</div>
	<div class="piano_wrapper" style:padding="{piano_padding}px" bind:this={piano_wrapper_el}>
		<Piano
			min_note={level_data.min_note}
			max_note={level_data.max_note}
			enabled_notes={level.trial?.valid_notes}
			{pressed_keys}
			{highlighted_keys}
			onpress={level.status === 'waiting_for_input'
				? (note) => on_press_key(note)
				: level.status === 'complete'
					? (note) => app.start_note(note)
					: undefined}
			onrelease={level.status === 'complete' ? app.stop_note : undefined}
		/>
	</div>
	<div class="feedback" class:success class:failure class:complete>
		{#if complete}
			<div class="completed_level_feedback">
				<div class="pane shadow_xl shadow_d_50 p_xl3 pt_0 box" transition:scale>
					<div class="box row" in:scale={{ duration: 3000 }}>
						<div class="completed_header_icon" in:fly={{ duration: 4000, x: -200 }}>♫</div>
						<div class="completed_header_icon" in:fly={{ duration: 4000, x: 200 }}>
							♩<sup>♪</sup>
						</div>
					</div>
					<!-- TODO buggy in Svelte 5 -   -->
					<div class="panel p_md mb_md box width:100%">
						<div class="panel p_md mb_md box">
							{#if level.mistakes === 0}
								<div class="font_size_xl3 text-align:center">flawless run!</div>
							{:else}
								<div class="font_size_xl3">
									{level.mistakes}
								</div>
								<div>
									mistake{plural(level.mistakes)} this run
								</div>
							{/if}
						</div>
						<div class="panel p_md">
							<LevelStatsSummary {level_data} {level_stats} />
						</div>
					</div>
					<!-- TODO buggy in Svelte 5 - in:scale={{delay: 500}} -->
					<button type="button" class="big mb_md" onclick={() => exit_level()}>
						go back to the map &nbsp;<code>Space</code>
					</button>
					<!-- TODO buggy in Svelte 5 - in:scale={{delay: 750}} -->
					<button type="button" class="big" onclick={() => level.reset()}>
						replay level &nbsp;<code>r</code>
					</button>
				</div>
			</div>
		{/if}
		{#if level.feedback}
			{@const feedback = level.feedback}
			<div class="feedback_text_bursts">
				{#key feedback}
					<div {@attach place_at_note(feedback.note)}>
						{#if feedback.kind === 'success'}
							<TextBurst count={11} items={['🎵', '🎶', '🌸', '🌻', '🌼', '🍀']} />
						{:else}
							<!-- TODO grayscale? -->
							<TextBurst count={5} items={['🦜', '⁉', '❔', '❌']} />
						{/if}
					</div>
				{/key}
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
		font-size: var(--font_size_xl3);
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
