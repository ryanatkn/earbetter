<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { slide } from 'svelte/transition';
	import Dialog from '@fuzdev/fuz_ui/Dialog.svelte';
	import Alert from '@fuzdev/fuz_ui/Alert.svelte';
	import { deep_equal } from '@fuzdev/fuz_util/deep_equal.ts';

	import { create_level_id, LevelData, to_level_data_error, type LevelId } from './level.svelte.ts';
	import {
		parse_intervals,
		serialize_intervals,
		MIDI_MAX,
		MIDI_MIN,
		type Midi,
		midi_names,
		Intervals,
		serialize_notes,
		parse_notes,
		DEFAULT_SCALE
	} from '../music.ts';
	import IntervalsInput from '../IntervalsInput.svelte';
	import NotesInput from '../NotesInput.svelte';
	import Piano from '../Piano.svelte';
	import ImportDataDialog from './ImportDataDialog.svelte';
	import { app_context } from './app.svelte.ts';

	interface Props {
		level_data: LevelData;
		editing?: boolean;
		onsubmit: (level_data: LevelData) => void;
		onremove?: (level_id: LevelId) => void;
		onduplicate?: (level_id: LevelId) => void;
		onplay?: (level_data: LevelData, changed: boolean) => void;
		onclose?: (level_id: LevelId) => void;
	}

	const {
		level_data,
		editing = false,
		onsubmit,
		onremove,
		onduplicate,
		onplay,
		onclose
	}: Props = $props();

	const app = app_context.get();

	let removing = $state(false);

	let updated_name: string = $derived(level_data.name);
	const normalized_updated_name = $derived(updated_name.trim());
	let updated_intervals: Intervals = $derived(level_data.intervals);
	let updated_tonics: ReadonlyArray<Midi> | null = $derived(level_data.tonics);
	const normalized_updated_tonics = $derived(
		updated_tonics
			? updated_tonics.filter((t) => t >= updated_min_note && t <= updated_max_note)
			: updated_tonics
	);
	let updated_trial_count: number = $derived(level_data.trial_count);
	let updated_sequence_length: number = $derived(level_data.sequence_length);
	let updated_min_note: Midi = $derived(level_data.min_note);
	let updated_max_note: Midi = $derived(level_data.max_note);

	const to_raw_data = () => ({
		id: level_data.id,
		name: normalized_updated_name,
		intervals: updated_intervals, // TODO filter out the invalid intervals
		tonics: normalized_updated_tonics, // select only the valid tonics
		trial_count: updated_trial_count,
		sequence_length: updated_sequence_length,
		min_note: updated_min_note,
		max_note: updated_max_note
	});
	const to_data = (): LevelData => s.parse_or_throw(LevelData, to_raw_data());

	// the form's inputs can hold values the schema rejects, like an empty name or a cleared number,
	// so validate instead of letting `to_data` throw on submit
	const level_data_error: string | null = $derived.by(() => {
		if (!normalized_updated_name) return 'the level needs a name';
		const parsed = s.parse(LevelData, to_raw_data());
		if (!parsed.ok) {
			const issue = parsed.issues[0]!;
			return `invalid ${issue.path.join('.') || 'level'}: ${issue.message}`;
		}
		return to_level_data_error(parsed.value);
	});

	const changed = $derived(
		normalized_updated_name !== level_data.name ||
			updated_trial_count !== level_data.trial_count ||
			updated_sequence_length !== level_data.sequence_length ||
			updated_min_note !== level_data.min_note ||
			updated_max_note !== level_data.max_note ||
			!deep_equal(updated_intervals, level_data.intervals) ||
			!deep_equal(normalized_updated_tonics, level_data.tonics)
	);

	let picking_intervals = $state(false);
	let picking_tonics = $state(false);
	let intervals_el: HTMLInputElement | undefined = $state();
	let tonics_el: HTMLInputElement | undefined = $state();
	const tonics_set = $derived(updated_tonics && new Set(updated_tonics));

	/**
	 * Parses imported level data, rejecting a level that can't be played.
	 */
	const parse_imported = (json: unknown): LevelData => {
		const parsed = s.parse_or_throw(LevelData, json);
		const error = to_level_data_error(parsed);
		if (error) throw Error(error);
		return parsed;
	};

	// TODO Putting these values here persists form values across UI states but not across page nav,
	// use SvelteKit snapshots for that - https://kit.svelte.dev/docs/snapshots
	let scale = $state(DEFAULT_SCALE);
	let octaves = $state(1);

	const lowest_note_error = $derived(updated_min_note >= updated_max_note);
</script>

<form class="width:100%" {@attach app.register_form('level')}>
	<header>
		<h2 class="my_0">
			{#if editing}editing level{:else}create a new level{/if}
		</h2>
	</header>
	<div class="fields">
		<fieldset>
			<label>
				<div class="title">name</div>
				<input bind:value={updated_name} />
			</label>
		</fieldset>
		<fieldset>
			<label class="mb_0" title="the semitones to include relative to the tonic">
				<div class="title">intervals</div>
				<input
					bind:this={intervals_el}
					value={serialize_intervals(updated_intervals)}
					onchange={(e) => (updated_intervals = parse_intervals(e.currentTarget.value))}
				/>
			</label>
			<button type="button" onclick={() => (picking_intervals = true)}>pick intervals</button>
			<details>
				<summary>about <code>intervals</code></summary>
				<p>
					<code>intervals</code> is a comma-separated list of numbers representing the
					<a href="https://wikipedia.org/wiki/Interval_(music)">musical intervals</a> used in the
					level, aka the number of piano keys
					(<a href="https://wikipedia.org/wiki/Semitone">semitones</a>) separating each note from
					the <a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> (see below)
				</p>
				<p>
					for example, to practice distinguishing between the
					<a href="https://wikipedia.org/wiki/Perfect_fourth">perfect fourth</a> and
					<a href="https://wikipedia.org/wiki/Perfect_fifth">perfect fifth</a>, enter
					"<code>5, 7</code>"
				</p>
				<p>negative numbers are allowed</p>
			</details>
		</fieldset>
		<fieldset>
			<label title="the number of trials per level">
				<div class="title">trial count</div>
				<div class="row">
					<input class="small_input" type="number" bind:value={updated_trial_count} min={1} />
					<input type="range" bind:value={updated_trial_count} min={1} max={20} />
				</div>
			</label>
		</fieldset>
		<fieldset>
			<label title="the number of notes per trial">
				<div class="title">sequence length</div>
				<div class="row">
					<input class="small_input" type="number" bind:value={updated_sequence_length} min={2} />
					<input type="range" bind:value={updated_sequence_length} min={2} max={16} />
				</div>
			</label>
		</fieldset>
		<fieldset class="row">
			<label class="text-align:center">
				<div class="title">lowest note</div>
				<div>{midi_names[updated_min_note]}</div>
				<input type="number" bind:value={updated_min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={updated_min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
			<label class="text-align:center">
				<div class="title">highest note</div>
				<div>{midi_names[updated_max_note]}</div>
				<input type="number" bind:value={updated_max_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={updated_max_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
		</fieldset>
		{#if lowest_note_error}
			<Alert status="error">the lowest note must be lower than the highest</Alert>
		{:else}
			<Piano
				max_height={50}
				min_note={updated_min_note}
				max_note={updated_max_note}
				highlighted_keys={tonics_set}
				clickable={false}
				middle_c_label
			/>
			<br />
		{/if}
		<fieldset>
			<label class="mb_0" title="the possible starting notes for each trial">
				<div class="title">tonics</div>
				<input
					bind:this={tonics_el}
					value={serialize_notes(updated_tonics)}
					onchange={(e) => (updated_tonics = parse_notes(e.currentTarget.value))}
					placeholder="all"
				/>
			</label>
			<button type="button" onclick={() => (picking_tonics = true)}>pick tonics</button>
			<details>
				<summary>about <code>tonics</code></summary>
				<p>
					The <a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> is like the "base" or
					"home" note, and for our purposes it's always the first note played in a trial. Other
					notes in the trial are calculated from the tonic and intervals. (see above)
				</p>
			</details>
		</fieldset>
		{#if level_data_error && !lowest_note_error}
			<Alert status="error">{level_data_error}</Alert>
		{/if}
		<button
			type="button"
			class="accent"
			onclick={() => onsubmit(to_data())}
			disabled={(editing && !changed) || !!level_data_error}
		>
			{#if editing}save changes to level{:else}create level{/if}
		</button>
		{#if onremove && editing}
			<button type="button" onclick={() => (removing = !removing)}>remove level</button>
			{#if removing}
				<div transition:slide class="pb_md">
					<button
						type="button"
						class="palette_c width:100%"
						onclick={() => {
							removing = false;
							onremove(level_data.id);
						}}
					>
						✕ confirm remove
					</button>
				</div>
			{/if}
			{#if onduplicate}
				<button type="button" onclick={() => onduplicate(level_data.id)}>duplicate level</button>
			{/if}
		{/if}
		<ImportDataDialog
			noun="level"
			data={level_data}
			{to_data}
			parse={parse_imported}
			create_id={create_level_id}
			onimport={onsubmit}
		>
			{#snippet children(open)}
				<button type="button" onclick={open}>
					{#if editing}import/export data{:else}import data{/if}
				</button>
			{/snippet}
		</ImportDataDialog>
		{#if onplay && editing}
			<button
				type="button"
				onclick={() => onplay(changed ? to_data() : level_data, changed)}
				disabled={changed && !!level_data_error}
			>
				play!
			</button>
		{/if}
		{#if onclose && editing}
			<button type="button" onclick={() => onclose(level_data.id)}>
				{#if changed}discard changes and stop editing{:else}close level editor{/if}
			</button>
		{/if}
	</div>
</form>
{#if picking_intervals}
	<Dialog
		onclose={() => {
			picking_intervals = false;
			intervals_el?.focus();
		}}
	>
		{#snippet children(dialog)}
			<div class="pane mx_auto shadow_xl shadow_d_50 p_xl width_atmost_md box">
				<h2 class="my_0">pick intervals</h2>
				<IntervalsInput
					intervals={updated_intervals}
					bind:scale
					bind:octaves
					oninput={(intervals) => {
						updated_intervals = intervals;
						dialog.close();
					}}
				/>
				<button type="button" onclick={dialog.close}>cancel</button>
			</div>
		{/snippet}
	</Dialog>
{/if}
{#if picking_tonics}
	<Dialog
		onclose={() => {
			picking_tonics = false;
			tonics_el?.focus();
		}}
	>
		{#snippet children(dialog)}
			<div class="pane mx_auto shadow_xl shadow_d_50 py_xl box">
				<h2 class="my_0">pick tonics</h2>
				<!-- TODO @many set reactivity - this `new Set` is a hack, probably change the data structure to a set, need serialization for storage -->
				<NotesInput
					notes={new Set(updated_tonics)}
					min_note={updated_min_note}
					max_note={updated_max_note}
					oninput={(notes) => {
						updated_tonics = notes;
						dialog.close();
					}}
				>
					{#snippet before_buttons()}
						<button type="button" class="mb_lg" onclick={dialog.close}>cancel</button>
					{/snippet}
				</NotesInput>
			</div>
		{/snippet}
	</Dialog>
{/if}

<style>
	.fields {
		display: flex;
		flex-direction: column;
	}

	.small_input {
		width: 75px;
		min-width: 75px;
	}

	button:not(:last-child) {
		margin-bottom: var(--space_md);
	}
</style>
