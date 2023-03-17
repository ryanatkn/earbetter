<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {parse_intervals, serialize_intervals, type LevelDef} from '$lib/earworm/level';
	import {BASE_LEVEL_DEF} from '$lib/earworm/level_defs';
	import {MIDI_MAX, MIDI_MIN} from '$lib/music/midi';
	import {midi_names} from '$lib/music/notes';

	const dispatch = createEventDispatcher<{save: LevelDef}>();

	export let id = 'new level';
	export let intervals = [4, 7, 12];
	export let trial_count = BASE_LEVEL_DEF.trial_count;
	export let sequence_length = BASE_LEVEL_DEF.sequence_length;
	export let note_min = BASE_LEVEL_DEF.note_min;
	export let note_max = BASE_LEVEL_DEF.note_max;

	const to_data = (): LevelDef => ({
		id,
		intervals,
		trial_count,
		sequence_length,
		note_min,
		note_max,
	});
</script>

<form class="level-def-form">
	<header>create a new level</header>
	<fieldset>
		<label>id<input bind:value={id} /></label>
		<label>trial_count<input type="number" bind:value={trial_count} /></label>
		<fieldset class="row">
			<label>
				<div>MIDI min</div>
				<div>{midi_names[note_min]}</div>
				<input type="number" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={note_min} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
			<label>
				<div>MIDI max</div>
				<div>{midi_names[note_max]}</div>
				<input type="number" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={note_max} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
		</fieldset>
		<label> sequence_length<input bind:value={sequence_length} /> </label>
		<label>
			intervals<input
				value={serialize_intervals(intervals)}
				on:input={(e) => parse_intervals(e.currentTarget.value)}
			/>
		</label>
	</fieldset>
	<button on:click={() => dispatch('save', to_data())}>save</button>
</form>

<style>
	header {
		font-size: var(--font_size_xl);
		text-align: center;
		margin-bottom: var(--spacing_md);
	}
</style>
