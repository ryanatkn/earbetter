<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import {slide} from 'svelte/transition';
	import Dialog from '@feltjs/felt-ui/Dialog.svelte';
	import Message from '@feltjs/felt-ui/Message.svelte';

	import {
		create_level_id,
		DEFAULT_LEVEL_NAME,
		DEFAULT_INTERVALS,
		DEFAULT_NOTE_MAX,
		DEFAULT_NOTE_MIN,
		DEFAULT_SEQUENCE_LENGTH,
		DEFAULT_TRIAL_COUNT,
		LevelDef,
		type LevelId,
	} from '$lib/earbetter/level';
	import {parse_intervals, serialize_intervals, midi_names} from '$lib/music/notes';
	import {MIDI_MAX, MIDI_MIN, type Midi} from '$lib/music/midi';

	const dispatch = createEventDispatcher<{submit: LevelDef; remove: LevelId}>();

	export let level_def: LevelDef | null = null;
	export let id = create_level_id();
	export let name = DEFAULT_LEVEL_NAME;
	export let intervals = DEFAULT_INTERVALS;
	export let trial_count: number = DEFAULT_TRIAL_COUNT;
	export let sequence_length: number = DEFAULT_SEQUENCE_LENGTH;
	export let note_min: Midi = DEFAULT_NOTE_MIN;
	export let note_max: Midi = DEFAULT_NOTE_MAX;
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

	$: set_level_def(level_def);
	const set_level_def = (level_def: LevelDef | null): void => {
		if (level_def) {
			id = level_def.id;
			name = level_def.name;
			intervals = level_def.intervals;
			trial_count = level_def.trial_count;
			sequence_length = level_def.sequence_length;
			note_min = level_def.note_min;
			note_max = level_def.note_max;
		} else {
			id = create_level_id();
			name = DEFAULT_LEVEL_NAME;
			intervals = DEFAULT_INTERVALS;
			trial_count = DEFAULT_TRIAL_COUNT;
			sequence_length = DEFAULT_SEQUENCE_LENGTH;
			note_min = DEFAULT_NOTE_MIN;
			note_max = DEFAULT_NOTE_MAX;
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

	// TODO lots of similarity with `ProjectForm`
	let importing = false;
	let serialized = '';
	let updated = '';
	$: changed_serialized = serialized !== updated;
	let parse_error_message = '';
	$: level_def, id, (parse_error_message = '');
	let level_data_el: HTMLTextAreaElement;
	let start_importing_el: HTMLButtonElement;

	const import_data = async (): Promise<void> => {
		parse_error_message = '';
		try {
			const json = JSON.parse(updated);
			// add an `id` if there is none
			if (json && !json.id) json.id = create_level_id();
			const parsed = LevelDef.parse(json);
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
</script>

{#if importing}
	<Dialog
		on:close={() => {
			importing = false;
			start_importing_el.focus();
		}}
	>
		<div class="importing markup padded-xl column centered">
			<h2>import level data</h2>
			<button
				on:click={() => {
					void navigator.clipboard.writeText(updated);
					level_data_el.select();
				}}
			>
				copy to clipboard
			</button>
			<textarea bind:value={updated} bind:this={level_data_el} />
			<button
				on:click={import_data}
				disabled={!changed_serialized}
				title={changed_serialized ? undefined : 'data has not changed'}
			>
				import project data
			</button>
		</div>
	</Dialog>
{/if}
<form class="level-def-form">
	<header>
		<h2>
			{#if editing}editing level{:else}create a custom level{/if}
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
					<code>intervals</code> is a comma-separated list of numbers representing the
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
		<button type="button" on:click={start_importing_data} bind:this={start_importing_el}>
			{#if editing}import/export data{:else}import data{/if}
		</button>
		{#if parse_error_message}
			<div class="message-wrapper">
				<Message status="error"><pre>{parse_error_message}</pre></Message>
			</div>
		{/if}
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
		<slot name="footer" {changed} {to_data} />
	</div>
</form>

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
