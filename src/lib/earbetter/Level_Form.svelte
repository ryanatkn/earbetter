<script lang="ts">
	import {slide} from 'svelte/transition';
	import Dialog from '@ryanatkn/fuz/Dialog.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import {dequal} from 'dequal';

	import {create_level_id, Level_Data, type Level_Id} from '$lib/earbetter/level.svelte.js';
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
		DEFAULT_SCALE,
	} from '$lib/music.js';
	import Intervals_Input from '$lib/Intervals_Input.svelte';
	import Notes_Input from '$lib/Notes_Input.svelte';
	import Piano from '$lib/Piano.svelte';
	import Copy_To_Clipboard from '$lib/earbetter/Copy_To_Clipboard.svelte';
	import {app_context} from '$lib/earbetter/app.svelte.js';

	interface Props {
		level_data: Level_Data;
		editing?: boolean;
		onsubmit: (level_data: Level_Data) => void;
		onremove?: (level_id: Level_Id) => void;
		onduplicate?: (level_id: Level_Id) => void;
		onplay?: (level_data: Level_Data, changed: boolean) => void;
		onclose?: (level_id: Level_Id) => void;
	}

	const {
		level_data,
		editing = false,
		onsubmit,
		onremove,
		onduplicate,
		onplay,
		onclose,
	}: Props = $props();

	const app = app_context.get();

	let removing = $state(false);

	let updated_name: string = $state(level_data.name);
	const normalized_updated_name = $derived((updated_name as any)?.trim());
	let updated_intervals: Intervals = $state.raw(level_data.intervals);
	let updated_tonics: ReadonlyArray<Midi> | null = $state.raw(level_data.tonics);
	const normalized_updated_tonics = $derived(
		updated_tonics
			? updated_tonics.filter((t) => t >= updated_min_note && t <= updated_max_note)
			: updated_tonics,
	);
	let updated_trial_count: number = $state(level_data.trial_count);
	let updated_sequence_length: number = $state(level_data.sequence_length);
	let updated_min_note: Midi = $state(level_data.min_note);
	let updated_max_note: Midi = $state(level_data.max_note);

	const to_data = (): Level_Data =>
		Level_Data.parse({
			id: level_data.id,
			name: normalized_updated_name,
			intervals: updated_intervals, // TODO filter out the invalid intervals
			tonics: normalized_updated_tonics, // select only the valid tonics
			trial_count: updated_trial_count,
			sequence_length: updated_sequence_length,
			min_note: updated_min_note,
			max_note: updated_max_note,
		});

	// TODO @many review this effect to try to remove it
	$effect(() => {
		updated_name = level_data.name;
		updated_intervals = level_data.intervals;
		updated_tonics = level_data.tonics;
		updated_trial_count = level_data.trial_count;
		updated_sequence_length = level_data.sequence_length;
		updated_min_note = level_data.min_note;
		updated_max_note = level_data.max_note;
	});

	const changed = $derived(
		normalized_updated_name !== level_data.name ||
			updated_trial_count !== level_data.trial_count ||
			updated_sequence_length !== level_data.sequence_length ||
			updated_min_note !== level_data.min_note ||
			updated_max_note !== level_data.max_note ||
			!dequal(updated_intervals, level_data.intervals) ||
			!dequal(normalized_updated_tonics, level_data.tonics),
	);

	// TODO lots of similarity with `Project_Form`
	let importing = $state(false);
	let picking_intervals = $state(false);
	let picking_tonics = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed_serialized = $derived(serialized !== updated);
	let parse_error_message = $state('');
	// TODO @many review this effect to try to remove it
	$effect(() => {
		level_data;
		parse_error_message = '';
	});
	let level_data_el: HTMLTextAreaElement | undefined = $state();
	let start_importing_el: HTMLButtonElement | undefined = $state();
	let intervals_el: HTMLInputElement | undefined = $state();
	let tonics_el: HTMLInputElement | undefined = $state();
	const tonics_set = $derived(updated_tonics && new Set(updated_tonics));

	const import_data = (): void => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_level_id();
			const parsed = Level_Data.parse(json);
			onsubmit(parsed);
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

	// TODO Putting these values here persists form values across UI states but not across page nav,
	// use SvelteKit snapshots for that - https://kit.svelte.dev/docs/snapshots
	// This is an object instead of as plain values because
	// Svelte errors on the non-$state `let` updates, and that'll work well with snapshots.
	let scale = $state(DEFAULT_SCALE);
	let octaves = $state(1);

	// TODO helper component for measuring? with `let:width` - first look at Svelte's new box bindings
	let piano_width: number | undefined = $state();

	const lowest_note_error = $derived(updated_min_note >= updated_max_note);
</script>

<!-- TODO this class `.level_def_form` is used to focus from another component -->
<form class="level_def_form w_100">
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
			<button type="button" onclick={() => (picking_intervals = true)}> pick intervals </button>
			<details>
				<summary>about <code>intervals</code></summary>
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
			<label class="text_align_center">
				<div class="title">lowest note</div>
				<div>{midi_names[updated_min_note]}</div>
				<input type="number" bind:value={updated_min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
				<input type="range" bind:value={updated_min_note} step={1} min={MIDI_MIN} max={MIDI_MAX} />
			</label>
			<label class="text_align_center">
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
				width={piano_width ?? 0}
				max_height={50}
				min_note={updated_min_note}
				max_note={updated_max_note}
				highlighted_keys={tonics_set}
				clickable={false}
				middle_c_label
			/>
			<br />
		{/if}
		<fieldset bind:clientWidth={piano_width}>
			<label class="mb_0" title="the possible starting notes for each trial">
				<div class="title">tonics</div>
				<input
					bind:this={tonics_el}
					value={serialize_notes(updated_tonics)}
					onchange={(e) => (updated_tonics = parse_notes(e.currentTarget.value))}
					placeholder="all"
				/>
			</label>
			<button type="button" onclick={() => (picking_tonics = true)}> pick tonics </button>
			<details>
				<summary>about <code>tonics</code></summary>
				<p>
					The <a href="https://wikipedia.org/wiki/Tonic_(music)">tonic</a> is like the "base" or "home"
					note, and for our purposes it's always the first note played in a trial. Other notes in the
					trial are calculated from the tonic and intervals. (see above)
				</p>
			</details>
		</fieldset>
		<button
			type="button"
			class="accent"
			onclick={() => onsubmit(to_data())}
			disabled={(editing && !changed) || lowest_note_error}
		>
			{#if editing}save changes to level{:else}create level{/if}
		</button>
		{#if onremove && editing}
			<button type="button" onclick={() => (removing = !removing)}> remove level </button>
			{#if removing}
				<div transition:slide class="pb_md">
					<button
						type="button"
						class="color_c w_100"
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
				<button type="button" onclick={() => onduplicate(level_data.id)}> duplicate level </button>
			{/if}
		{/if}
		<button type="button" onclick={start_importing_data} bind:this={start_importing_el}>
			{#if editing}import/export data{:else}import data{/if}
		</button>
		{#if parse_error_message}
			<div class="overflow_x_auto">
				<Alert status="error"><pre>{parse_error_message}</pre></Alert>
			</div>
		{/if}
		{#if onplay && editing}
			<button type="button" onclick={() => onplay(changed ? to_data() : level_data, changed)}>
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
{#if importing}
	<Dialog
		onclose={() => {
			importing = false;
			start_importing_el?.focus();
		}}
	>
		<div class="importing pane shadow_d_xl p_xl width_md mx_auto">
			<h2 class="my_0">import level data</h2>
			<Copy_To_Clipboard
				text={updated}
				oncopy={() => {
					level_data_el?.select();
				}}
			/>
			<textarea bind:value={updated} bind:this={level_data_el}></textarea>
			<button
				type="button"
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
		onclose={() => {
			picking_intervals = false;
			intervals_el?.focus();
		}}
	>
		{#snippet children(close)}
			<div class="pane mx_auto shadow_d_xl p_xl width_md box">
				<h2 class="my_0">pick intervals</h2>
				<Intervals_Input
					intervals={updated_intervals}
					bind:scale
					bind:octaves
					oninput={(intervals) => {
						updated_intervals = intervals;
						close();
					}}
				/>
				<button type="button" onclick={close}>cancel</button>
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
		{#snippet children(close)}
			<div class="pane shadow_d_xl py_xl box">
				<h2 class="my_0">pick tonics</h2>
				<!-- TODO @many set reactivity - this `new Set` is a hack, probably change the data structure to a set, need serialization for storage -->
				<Notes_Input
					audio_state={app}
					notes={new Set(updated_tonics)}
					min_note={updated_min_note}
					max_note={updated_max_note}
					oninput={(notes) => {
						updated_tonics = notes;
						close();
					}}
				>
					{#snippet before_buttons()}
						<button type="button" class="mb_lg" onclick={close}>cancel</button>
					{/snippet}
				</Notes_Input>
			</div>
		{/snippet}
	</Dialog>
{/if}

<style>
	.fields {
		display: flex;
		flex-direction: column;
	}
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}

	.small_input {
		width: 75px;
		min-width: 75px;
	}

	button:not(:last-child) {
		margin-bottom: var(--space_md);
	}
</style>
