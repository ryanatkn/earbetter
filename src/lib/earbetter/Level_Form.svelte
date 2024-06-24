<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {
		create_level_id,
		DEFAULT_LEVEL_NAME,
		DEFAULT_INTERVALS,
		DEFAULT_MAX_NOTE,
		DEFAULT_MIN_NOTE,
		DEFAULT_SEQUENCE_LENGTH,
		DEFAULT_TRIAL_COUNT,
		Level_Data,
		type Level_Id,
		DEFAULT_TONICS,
	} from '$lib/earbetter/level.js';
	import {
		parse_intervals,
		serialize_intervals,
		MIDI_MAX,
		MIDI_MIN,
		type Midi,
		midi_names,
		Scale,
		Intervals,
		serialize_notes,
		parse_notes,
	} from '$lib/music.js';
	import Intervals_Input from '$lib/Intervals_Input.svelte';
	import Notes_Input from '$lib/Notes_Input.svelte';
	import Piano from '$lib/Piano.svelte';

	const dispatch = createEventDispatcher<{
		submit: Level_Data;
		remove: Level_Id;
		duplicate: Level_Id;
	}>();

	export let level_data: Level_Data | null = null;
	export let id: Level_Id = create_level_id();
	export let name = DEFAULT_LEVEL_NAME;
	export let intervals: Intervals = DEFAULT_INTERVALS;
	export let tonics: Midi[] | null = DEFAULT_TONICS;
	export let trial_count: number = DEFAULT_TRIAL_COUNT;
	export let sequence_length: number = DEFAULT_SEQUENCE_LENGTH;
	export let min_note: Midi = DEFAULT_MIN_NOTE;
	export let max_note: Midi = DEFAULT_MAX_NOTE;
	export let editing = false;

	let removing = false;

	const to_data = (): Level_Data => ({
		id,
		name,
		intervals, // TODO filter out the invalid intervals
		tonics: tonics ? tonics.filter((t) => t >= min_note && t <= max_note) : tonics, // select only the valid tonics
		trial_count,
		sequence_length,
		min_note,
		max_note,
	});

	$: set_level_data(level_data);
	const set_level_data = (level_data: Level_Data | null): void => {
		if (level_data) {
			id = level_data.id;
			name = level_data.name;
			intervals = level_data.intervals;
			tonics = level_data.tonics;
			trial_count = level_data.trial_count;
			sequence_length = level_data.sequence_length;
			min_note = level_data.min_note;
			max_note = level_data.max_note;
		} else {
			id = create_level_id();
			name = DEFAULT_LEVEL_NAME;
			intervals = DEFAULT_INTERVALS;
			tonics = DEFAULT_TONICS;
			trial_count = DEFAULT_TRIAL_COUNT;
			sequence_length = DEFAULT_SEQUENCE_LENGTH;
			min_note = DEFAULT_MIN_NOTE;
			max_note = DEFAULT_MAX_NOTE;
		}
	};

	$: changed =
		!level_data ||
		id !== level_data.id ||
		name !== level_data.name ||
		trial_count !== level_data.trial_count ||
		sequence_length !== level_data.sequence_length ||
		min_note !== level_data.min_note ||
		max_note !== level_data.max_note ||
		intervals.toString() !== level_data.intervals.toString() ||
		tonics?.toString() !== level_data.tonics?.toString(); // TODO speed these comparisons up

	// TODO lots of similarity with `Project_Form`
	let importing = false;
	let picking_intervals = false;
	let picking_tonics = false;
	let serialized = '';
	let updated = '';
	$: changed_serialized = serialized !== updated;
	let parse_error_message = '';
	$: level_data, id, (parse_error_message = '');
	let level_data_el: HTMLTextAreaElement;
	let start_importing_el: HTMLButtonElement;
	let intervals_el: HTMLInputElement;
	let tonics_el: HTMLInputElement;
	$: tonics_set = tonics && new Set(tonics);

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_level_id();
			const parsed = Level_Data.parse(json);
			dispatch('submit', parsed);
		} catch (err) {
			console.error('failed to import data', err);
			parse_error_message = err.message || 'unknown error';
		}
		importing = false;
	};

	const start_importing_data = () => {
		serialized = updated = JSON.stringify(to_data());
		importing = true;
	};

	// this persists form values across UI states but not across page nav,
	// would use SvelteKit snapshots for that - https://kit.svelte.dev/docs/snapshots
	let intervals_input_selected_scale: Scale;
	let intervals_input_octaves: number;

	// TODO helper component for measuring? with `let:width` - first look at Svelte's new box bindings
	let piano_width: number | undefined;

	$: lowest_note_error = min_note >= max_note;
</script>

<form class="level-def-form">
	<header>
		<h2>
			{#if editing}editing level{:else}create a new level{/if}
		</h2>
	</header>
	<div class="fields">
		<fieldset>
			<label>
				<div class="title">name</div>
				<input bind:value={name} />
			</label>
		</fieldset>
		<fieldset>
			<label style:margin-bottom={0}>
				<div class="title">intervals</div>
				<input
					bind:this={intervals_el}
					value={serialize_intervals(intervals)}
					on:input={(e) => (intervals = parse_intervals(e.currentTarget.value))}
				/>
			</label>
			<button type="button" onclick={() => (picking_intervals = true)}> pick intervals </button>
			<details>
				<summary>more about <code>intervals</code></summary>
				<p>
					<code>intervals</code> is a comma-separated list of numbers representing the
					<a href="https://wikipedia.org/wiki/Interval_(music)">musical intervals</a> used in the
					level, aka the number of piano keys (<a href="https://wikipedia.org/wiki/Semitone"
						>semitones</a
					>) separating each note from the
					<a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> (see below)
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
				<div class="title">trial count</div>
				<input type="number" bind:value={trial_count} min={1} />
				<input type="range" bind:value={trial_count} min={1} max={20} />
			</label>
		</fieldset>
		<fieldset>
			<label>
				<div class="title">sequence length</div>
				<input bind:value={sequence_length} min={2} />
				<input type="range" bind:value={sequence_length} min={2} max={16} />
			</label>
		</fieldset>
		<fieldset class="row">
			<label>
				<div class="title">lowest note</div>
				<div>{midi_names[min_note]}</div>
				<input type="number" bind:value={min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
			<label>
				<div class="title">highest note</div>
				<div>{midi_names[max_note]}</div>
				<input type="number" bind:value={max_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={max_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
		</fieldset>
		{#if lowest_note_error}
			<Alert status="error">the lowest note must be lower than the highest</Alert>
		{:else}
			<Piano
				width={piano_width || 0}
				max_height={50}
				{min_note}
				{max_note}
				highlighted_keys={tonics_set}
				clickable={false}
			/>
			<br />
		{/if}
		<fieldset bind:clientWidth={piano_width}>
			<label style:margin-bottom={0}>
				<div class="title">tonics</div>
				<input
					bind:this={tonics_el}
					value={serialize_notes(tonics)}
					on:input={(e) => (tonics = parse_notes(e.currentTarget.value))}
					placeholder="all"
				/>
			</label>
			<button type="button" onclick={() => (picking_tonics = true)}> pick tonics </button>
			<details>
				<summary>more about <code>tonics</code></summary>
				<p>
					the <a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> is like the "base" or "home"
					note, and for our purposes it's always the first note played in a trial, and other notes in
					the trial are calculated from the tonic and intervals (see above)
				</p>
			</details>
		</fieldset>
		<button
			class="accent"
			type="button"
			onclick={() => dispatch('submit', to_data())}
			disabled={(editing && !changed) || lowest_note_error}
		>
			{#if editing}save changes to level{:else}create level{/if}
		</button>
		{#if editing}
			<button type="button" style:margin-bottom={0} onclick={() => (removing = !removing)}>
				remove level
			</button>
			{#if removing}
				<div transition:slide|local>
					<button
						class="w_100"
						type="button"
						style:margin-bottom={0}
						onclick={() => {
							removing = false;
							dispatch('remove', id);
						}}
					>
						✖ confirm remove
					</button>
				</div>
			{/if}
			<button
				type="button"
				style:margin-top="var(--space_lg)"
				onclick={() => dispatch('duplicate', id)}
			>
				duplicate
			</button>
		{/if}
		<button type="button" onclick={start_importing_data} bind:this={start_importing_el}>
			{#if editing}import/export data{:else}import data{/if}
		</button>
		{#if parse_error_message}
			<div class="message-wrapper">
				<Alert status="error"><pre>{parse_error_message}</pre></Alert>
			</div>
		{/if}
		<slot name="footer" {changed} {to_data} />
	</div>
</form>
{#if importing}
	<Dialog
		on:close={() => {
			importing = false;
			start_importing_el.focus();
		}}
	>
		<div class="importing p_xl width_md box">
			<h2>import level data</h2>
			<button
				onclick={() => {
					void navigator.clipboard.writeText(updated);
					level_data_el.select();
				}}
			>
				copy to clipboard
			</button>
			<textarea bind:value={updated} bind:this={level_data_el} />
			<button
				onclick={import_data}
				disabled={!changed_serialized}
				title={changed_serialized ? undefined : 'data has not changed'}
			>
				import project data
			</button>
		</div>
	</Dialog>
{/if}
{#if picking_intervals}
	<Dialog
		let:close
		on:close={() => {
			picking_intervals = false;
			intervals_el.focus();
		}}
	>
		<div class="p_xl width_md box">
			<h2>pick intervals</h2>
			<Intervals_Input
				bind:selected_scale={intervals_input_selected_scale}
				bind:octaves={intervals_input_octaves}
				on:input={(e) => {
					intervals = e.detail;
					close();
				}}
			/>
		</div>
	</Dialog>
{/if}
{#if picking_tonics}
	<Dialog
		let:close
		on:close={() => {
			picking_tonics = false;
			tonics_el.focus();
		}}
	>
		<div class="p_xl width_md box">
			<h2>pick tonics</h2>
			<!-- TODO this `new Set` is a hack, probably change the data structure to a set, need serialization for storage -->
			<Notes_Input
				notes={new Set(tonics)}
				{min_note}
				{max_note}
				on:input={(e) => {
					tonics = e.detail;
					close();
				}}
			/>
		</div>
	</Dialog>
{/if}

<style>
	.level-def-form {
		width: 100%;
	}
	.fields {
		display: flex;
		flex-direction: column;
	}
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
	.message-wrapper {
		overflow-x: auto;
	}
</style>
