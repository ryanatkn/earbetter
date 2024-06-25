<script lang="ts">
	import type {Signal} from '@preact/signals-core';
	import {slide} from 'svelte/transition';

	import type {MIDIAccess} from '$lib/WebMIDI.js';
	import {get_ac} from '$lib/ac.js';
	import Init_Midi_Button from '$lib/Init_Midi_Button.svelte';
	import Level_Form from '$lib/earbetter/Level_Form.svelte';
	import Projects from '$lib/earbetter/Projects.svelte';
	import Volume_Control from '$lib/Volume_Control.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers.js';
	import Instrument_Control from '$lib/Instrument_Control.svelte';
	import type {App} from '$lib/earbetter/app.js';
	import Controls_Instructions from '$lib/earbetter/Controls_Instructions.svelte';
	import Midi_Input from '$lib/Midi_Input.svelte';
	import {start_playing, stop_playing} from '$lib/play_note.js';
	import Realms from '$lib/earbetter/Realms.svelte';
	import {MISTAKE_HISTORY_LENGTH} from '$lib/earbetter/level.js';
	import Realm_Editor from '$lib/earbetter/Realm_Editor.svelte';
	import Level_Map_Items from '$lib/earbetter/Level_Map_Items.svelte';
	import Project_Editor from '$lib/earbetter/Project_Editor.svelte';

	interface Props {
		app: App;
		midi_access: Signal<MIDIAccess | null>;
	}

	const {app, midi_access}: Props = $props();

	const {
		project_datas: projects,
		editing_project,
		editing_project_data,
		selected_project_data,
		realms,
		editing_realm,
		editing_realm_data,
		levels,
		editing_level,
		draft_level_data,
		selected_realm_id,
		show_game_help,
		toggle_game_help,
		play_level,
		edit_level,
		remove_level,
		duplicate_level,
		create_level,
		update_level,
	} = $derived(app);

	const ac = get_ac();
	(window as any).audio = ac;

	const volume = get_volume();
	const instrument = get_instrument();

	let id: string | undefined = $state();
	const editing = $derived($levels ? $levels.some((d) => d.id === id) : false);

	const no_realms = $derived(!$realms?.length);
</script>

<Midi_Input
	{midi_access}
	onnotestart={(note, velocity) => {
		start_playing(ac, note, with_velocity($volume, velocity), $instrument);
	}}
	onnotestop={(note) => {
		stop_playing(note);
	}}
/>
<div class="map">
	{#if $projects.length}
		<div class="width_sm">
			{#if $selected_project_data}
				<section class="card" transition:slide|local>
					<Projects {app} />
				</section>
			{/if}
			{#if ($editing_project && $editing_project_data) || !$selected_project_data}
				<section class="card" transition:slide|local>
					<Project_Editor {app} />
				</section>
			{/if}
			<section class="card" transition:slide|local>
				<div class="panel p_md">
					<header>
						<h2>controls</h2>
					</header>
					<Controls_Instructions />
					<Volume_Control {volume} />
					<Instrument_Control {instrument} />
					<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
					<Init_Midi_Button {midi_access} />
				</div>
			</section>
		</div>
	{/if}
	<div class="width_sm">
		{#if $show_game_help}
			<section class="card" transition:slide|local>
				<div class="panel p_md">
					<p>
						Earbetter is an <a href="https://wikipedia.org/wiki/Ear_training">ear training</a> tool:
					</p>
					<ul>
						<li>each level is a standalone challenge that's a series of trials</li>
						<li>
							your level score is the sum of mistakes in your best {MISTAKE_HISTORY_LENGTH}
							runs, win a ★ at 0
						</li>
						<li>realms group levels into bigger challenges</li>
						<li>projects group realms so you can customize various experiences</li>
					</ul>
					<p>more info in <a href="https://github.com/ryanatkn/earbetter">the readme</a></p>
					<aside>
						Earbetter is in early development, and many things are unfinished and unknown - feedback
						is appreciated on <a href="https://github.com/ryanatkn/earbetter"
							>the GitHub discussions and issues</a
						>
					</aside>
					<div class="box row">
						<button style:margin="0" onclick={() => toggle_game_help()}>ok, hide this</button>
					</div>
				</div>
			</section>
		{/if}
		<section class="card">
			<Realms {app} />
		</section>
		{#if ($editing_realm && $editing_realm_data) || no_realms}
			<section class="card" transition:slide|local>
				<Realm_Editor {app} />
			</section>
		{/if}
	</div>
	{#if $projects.length}
		<div class="width_sm">
			{#if $levels}
				<section class="card" transition:slide|local>
					<Level_Map_Items {app} levels={$levels} />
				</section>
			{/if}
			{#if $selected_realm_id && (($editing_level && $levels) || $levels?.length === 0)}
				<section class="card" transition:slide|local>
					<div class="panel p_md">
						<Level_Form
							{editing}
							bind:id
							level_data={$draft_level_data}
							onsubmit={(editing ? update_level : create_level)
								? (level_data) => (editing ? update_level : create_level)(level_data)
								: undefined}
							onremove={(level_id) => remove_level(level_id)}
							onduplicate={(level_id) => duplicate_level(level_id)}
						>
							{#snippet footer(changed, to_data)}
								{#if editing}
									<button
										type="button"
										onclick={async () => {
											if (!id) return;
											if (changed) update_level(to_data());
											await play_level(id);
										}}
									>
										play!
									</button>
									<button type="button" onclick={() => edit_level(null)}>
										{#if changed}discard changes and stop editing{:else}stop editing this level{/if}
									</button>
								{/if}
							{/snippet}
						</Level_Form>
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	.map {
		--icon_button_width: 60px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: flex-start;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.width_sm {
		margin: 0 var(--space_xl);
	}
	@media (max-width: 1111px) {
		.map {
			flex-direction: column;
			align-items: center;
		}
		.width_sm {
			margin-left: 0;
			margin-right: 0;
		}
	}
</style>
