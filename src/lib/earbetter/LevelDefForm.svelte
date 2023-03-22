<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';

	import {create_id, LevelDef, type LevelId} from '$lib/earbetter/level';
	import {parse_intervals, serialize_intervals, midi_names} from '$lib/music/notes';
	import {BASE_LEVEL_DEF} from '$lib/earbetter/level_defs';
	import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';

	const dispatch = createEventDispatcher<{submit: LevelDef; remove: LevelId}>();

	const DEFAULT_NAME = 'new custom level';
	const DEFAULT_INTERVALS = [4, 7, 12];

	export let level_def: LevelDef | null = null;
	export let id = create_id();
	export let name = DEFAULT_NAME;
	export let intervals = DEFAULT_INTERVALS;
	export let trial_count: number = BASE_LEVEL_DEF.trial_count;
	export let sequence_length: number = BASE_LEVEL_DEF.sequence_length;
	export let note_min: Midi = BASE_LEVEL_DEF.note_min;
	export let note_max: Midi = BASE_LEVEL_DEF.note_max;
	export let editing = false;

	let removing = false;

	const to_data = (): LevelDef => ({
		id,
		name,
		intervals,
		trial_count,
		sequence_length,
		note_min,
		note_max,
	});

	export const set_level_def = (level_def: LevelDef | null): void => {
		if (level_def) {
			id = level_def.id;
			name = level_def.name;
			intervals = level_def.intervals;
			trial_count = level_def.trial_count;
			sequence_length = level_def.sequence_length;
			note_min = level_def.note_min;
			note_max = level_def.note_max;
		} else {
			id = create_id();
			name = DEFAULT_NAME;
			intervals = DEFAULT_INTERVALS;
			trial_count = BASE_LEVEL_DEF.trial_count;
			sequence_length = BASE_LEVEL_DEF.sequence_length;
			note_min = BASE_LEVEL_DEF.note_min;
			note_max = BASE_LEVEL_DEF.note_max;
		}
	};

	$: changed =
		!level_def ||
		id !== level_def.id ||
		name !== level_def.name ||
		trial_count !== level_def.trial_count ||
		sequence_length !== level_def.sequence_length ||
		note_min !== level_def.note_min ||
		note_max !== level_def.note_max ||
		intervals.toString() !== level_def.intervals.toString();

	let expanded = false;
	$: if (editing) expanded = true;

	const import_data = () => {
		const data = to_data();
		const serialized = JSON.stringify(data);
		// TODO refactor
		const imported = prompt('data for this level: ', serialized); // eslint-disable-line no-alert
		if (imported) {
			try {
				set_level_def(LevelDef.parse(JSON.parse(imported)));
			} catch (err) {
				console.error('failed to parse', err, imported);
			}
		}
	};
</script>

<form class="level-def-form">
	<header>
		<h2>
			{#if editing}editing level{:else}create a custom level{/if}
		</h2>
	</header>
	{#if editing || expanded}
		<div class="fields">
			<fieldset>
				<label>
					<div class="title">name</div>
					<input bind:value={name} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					<div class="title">intervals</div>
					<input
						value={serialize_intervals(intervals)}
						on:input={(e) => (intervals = parse_intervals(e.currentTarget.value))}
					/>
				</label>
				<details>
					<summary>more info</summary>
					<p>
						this is a comma-separated list of numbers representing the
						<a href="https://wikipedia.org/wiki/Interval_(music)">musical intervals</a> used in the
						level, aka the number of piano keys (<a href="https://wikipedia.org/wiki/Semitone"
							>semitones</a
						>) separating each note from the
						<a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> (the base note)
					</p>
					<p>
						for example, to practice distinguishing between the <a
							href="https://wikipedia.org/wiki/Perfect_fourth">perfect fourth</a
						>
						and <a href="https://wikipedia.org/wiki/Perfect_fifth">perfect fifth</a>, enter "<code
							>5, 7</code
						>"
					</p>
					<p>negative numbers are allowed</p>
				</details>
			</fieldset>
			<fieldset>
				<label>
					<div class="title">trial_count</div>
					<input type="number" bind:value={trial_count} min={1} />
					<input type="range" bind:value={trial_count} min={1} max={20} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					<div class="title">sequence_length</div>
					<input bind:value={sequence_length} min={2} />
					<input type="range" bind:value={sequence_length} min={2} max={16} />
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
			<fieldset>
				<label>
					<div class="title">id</div>
					<input disabled value={id} />
				</label>
			</fieldset>
			<button
				type="button"
				on:click={() => dispatch('submit', to_data())}
				disabled={editing && !changed}
			>
				{#if editing}save changes to level{:else}create level{/if}
			</button>
			<button type="button" on:click={import_data}>
				{#if editing}import/export data{:else}import data{/if}
			</button>
			{#if editing}
				<button type="button" on:click={() => (removing = !removing)}> remove level </button>
				{#if removing}
					<div transition:slide|local>
						<button
							class="w-full"
							type="button"
							on:click={() => {
								removing = false;
								dispatch('remove', id);
							}}
						>
							✖ confirm remove
						</button>
					</div>
				{/if}
			{/if}
			<slot name="footer" {changed} />
		</div>
	{:else}
		<button on:click={() => (expanded = true)}>make a new level</button>
	{/if}
</form>

<style>
	header {
		font-size: var(--font_size_xl);
		text-align: center;
		margin-bottom: var(--spacing_md);
	}
	.fields {
		display: flex;
		flex-direction: column;
	}
</style>
