<script lang="ts">
	import type {Signal} from '@preact/signals-core';
	import {slide} from 'svelte/transition';

	import type {MIDIAccess} from '$lib/WebMIDI';
	import {get_ac} from '$lib/ac';
	import InitMidiButton from '$lib/InitMidiButton.svelte';
	import LevelForm from '$lib/earbetter/LevelForm.svelte';
	import Projects from '$lib/earbetter/Projects.svelte';
	import VolumeControl from '$lib/VolumeControl.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/helpers';
	import InstrumentControl from '$lib/InstrumentControl.svelte';
	import type {App} from '$lib/earbetter/app';
	import ControlsInstructions from '$lib/earbetter/ControlsInstructions.svelte';
	import MidiInput from '$lib/MidiInput.svelte';
	import {start_playing, stop_playing} from '$lib/play_note';
	import Realms from '$lib/earbetter/Realms.svelte';
	import {MISTAKE_HISTORY_LENGTH} from '$lib/earbetter/level';
	import RealmEditor from '$lib/earbetter/RealmEditor.svelte';
	import LevelMapItems from '$lib/earbetter/LevelMapItems.svelte';
	import ProjectEditor from '$lib/earbetter/ProjectEditor.svelte';

	export let app: App;
	export let midi_access: Signal<MIDIAccess | null>;

	$: ({
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
	} = app);

	const ac = get_ac();
	(window as any).audio = ac;

	const volume = get_volume();
	const instrument = get_instrument();

	let id: string;
	$: editing = $levels ? $levels.some((d) => d.id === id) : false;

	$: no_realms = !$realms?.length;
</script>

<MidiInput
	{midi_access}
	on:note_start={(e) => {
		start_playing(ac, e.detail.note, with_velocity($volume, e.detail.velocity), $instrument);
	}}
	on:note_stop={(e) => {
		stop_playing(e.detail.note);
	}}
/>
<div class="map">
	{#if $projects.length}
		<div class="column-sm">
			{#if $selected_project_data}
				<section class="card" transition:slide|local>
					<Projects {app} />
				</section>
			{/if}
			{#if ($editing_project && $editing_project_data) || !$selected_project_data}
				<section class="card" transition:slide|local>
					<ProjectEditor {app} />
				</section>
			{/if}
			<section class="card" transition:slide|local>
				<div class="panel padded_md prose">
					<header>
						<h2>controls</h2>
					</header>
					<ControlsInstructions />
					<VolumeControl {volume} />
					<InstrumentControl {instrument} />
					<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
					<InitMidiButton {midi_access} />
				</div>
			</section>
		</div>
	{/if}
	<div class="column-sm">
		{#if $show_game_help}
			<section class="card" transition:slide|local>
				<div class="panel padded_md">
					<div class="prose">
						<p>
							Earbetter is an <a href="https://wikipedia.org/wiki/Ear_training">ear training</a> tool/game:
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
							Earbetter is in early development, and many things are unfinished and unknown -
							feedback is appreciated on <a href="https://github.com/ryanatkn/earbetter"
								>the GitHub discussions and issues</a
							>
						</aside>
						<div class="box row">
							<button style:margin="0" on:click={() => toggle_game_help()}>ok, hide this</button>
						</div>
					</div>
				</div>
			</section>
		{/if}
		<section class="card">
			<Realms {app} />
		</section>
		{#if ($editing_realm && $editing_realm_data) || no_realms}
			<section class="card" transition:slide|local>
				<RealmEditor {app} />
			</section>
		{/if}
	</div>
	{#if $projects.length}
		<div class="column-sm">
			{#if $levels}
				<section class="card" transition:slide|local>
					<LevelMapItems {app} levels={$levels} />
				</section>
			{/if}
			{#if $selected_realm_id && (($editing_level && $levels) || $levels?.length === 0)}
				<section class="card" transition:slide|local>
					<div class="panel padded_md prose">
						<LevelForm
							{editing}
							bind:id
							level_data={$draft_level_data}
							on:submit={(editing ? update_level : create_level)
								? (e) => (editing ? update_level : create_level)(e.detail)
								: undefined}
							on:remove={(e) => remove_level(e.detail)}
							on:duplicate={(e) => duplicate_level(e.detail)}
						>
							<svelte:fragment slot="footer" let:changed let:to_data>
								{#if editing}
									<button
										type="button"
										on:click={async () => {
											if (changed) update_level(to_data());
											await play_level(id);
										}}
									>
										play!
									</button>
									<button type="button" on:click={() => edit_level(null)}>
										{#if changed}discard changes and stop editing{:else}stop editing this level{/if}
									</button>
								{/if}
							</svelte:fragment>
						</LevelForm>
					</div>
				</section>
			{/if}
		</div>
	{/if}
</div>

<style>
	.map {
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
	.column-sm {
		margin: 0 var(--spacing_xl);
	}
	@media (max-width: 1111px) {
		.map {
			flex-direction: column;
			align-items: center;
		}
		.column-sm {
			margin-left: 0;
			margin-right: 0;
		}
	}
</style>
