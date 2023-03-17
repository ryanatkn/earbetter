<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {parse_intervals, serialize_intervals, type LevelDef} from '$lib/earworm/level';
	import {BASE_LEVEL_DEF} from '$lib/earworm/level_defs';
	import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';
	import {midi_names} from '$lib/music/notes';

	const dispatch = createEventDispatcher<{create: LevelDef}>();

	export let id = 'new custom level';
	export let intervals = [4, 7, 12];
	export let trial_count: number = BASE_LEVEL_DEF.trial_count;
	export let sequence_length: number = BASE_LEVEL_DEF.sequence_length;
	export let note_min: Midi = BASE_LEVEL_DEF.note_min;
	export let note_max: Midi = BASE_LEVEL_DEF.note_max;
	export let editing = false;

	const to_data = (): LevelDef => ({
		id,
		intervals,
		trial_count,
		sequence_length,
		note_min,
		note_max,
	});

	// TODO BLOCK need so say `update level` somehow

	// TODO BLOCK update level button should be disabled when no changes

	export const set_level_def = (level_def: LevelDef): void => {
		id = level_def.id;
		intervals = level_def.intervals;
		trial_count = level_def.trial_count;
		sequence_length = level_def.sequence_length;
		note_min = level_def.note_min;
		note_max = level_def.note_max;
	};
</script>

<form class="level-def-form">
	<header>
		{#if editing}editing{:else}create a{/if} custom level
	</header>
	<fieldset>
		<label>
			<div class="title">id</div>
			<input bind:value={id} />
		</label>
	</fieldset>
	<fieldset>
		<label>
			<div class="title">intervals</div>
			<input
				value={serialize_intervals(intervals)}
				on:input={(e) => parse_intervals(e.currentTarget.value)}
			/>
		</label>
		<p>
			a comma-separated list of numbers representing the <a
				href="https://wikipedia.org/wiki/Interval_(music)">musical intervals</a
			>, the number of piano keys (<a href="https://wikipedia.org/wiki/Semitone">semitones</a>)
			separating each note from the
			<a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> (the base note)
		</p>
		<p>
			for example, to train to distinguish between the <a
				href="https://wikipedia.org/wiki/Perfect_fourth">perfect fourth</a
			>
			and <a href="https://wikipedia.org/wiki/Perfect_fifth">perfect fifth</a>, enter "<code
				>5, 7</code
			>"
		</p>
	</fieldset>
	<fieldset>
		<label>
			<div class="title">trial_count</div>
			<input type="number" bind:value={trial_count} min={1} />
			<input type="range" bind:value={trial_count} min={1} max={30} />
		</label>
	</fieldset>
	<fieldset>
		<label>
			<div class="title">sequence_length</div>
			<input bind:value={sequence_length} min={2} />
			<input type="range" bind:value={sequence_length} min={2} max={20} />
		</label>
	</fieldset>
	<fieldset class="row">
		<label>
			<div class="title">MIDI min</div>
			<div>{midi_names[note_min]}</div>
			<input type="number" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			<input type="range" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
		</label>
		<label>
			<div class="title">MIDI max</div>
			<div>{midi_names[note_max]}</div>
			<input type="number" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			<input type="range" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
		</label>
	</fieldset>
	<button type="button" on:click={() => dispatch('create', to_data())}>
		{#if editing}update{:else}create{/if} level
	</button>
</form>

<style>
	header {
		font-size: var(--font_size_xl);
		text-align: center;
		margin-bottom: var(--spacing_md);
	}
</style>
