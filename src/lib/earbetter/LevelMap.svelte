<script lang="ts">
	import type {Signal} from '@preact/signals-core';
	import {slide} from 'svelte/transition';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import {get_ac} from '$lib/audio/ac';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import LevelDefForm from '$lib/earbetter/LevelDefForm.svelte';
	import Projects from '$lib/earbetter/Projects.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import {get_instrument, get_volume, with_velocity} from '$lib/audio/helpers';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';
	import type {App} from '$lib/earbetter/app';
	import ControlsInstructions from '$lib/earbetter/ControlsInstructions.svelte';
	import MidiInput from '$lib/audio/MidiInput.svelte';
	import {start_playing, stop_playing} from '$lib/audio/play_note';
	import Realms from '$lib/earbetter/Realms.svelte';
	import {MISTAKE_HISTORY_LENGTH} from '$lib/earbetter/level';
	import RealmEditor from '$lib/earbetter/RealmEditor.svelte';
	import LevelMapItems from '$lib/earbetter/LevelMapItems.svelte';

	export let app: App;
	export let midi_access: Signal<MIDIAccess | null>;

	$: ({
		project_defs,
		editing_level,
		editing_level_def,
		level_defs,
		selected_realm_id,
		show_game_help,
		toggle_game_help,
		play_level_def,
		edit_level_def,
		remove_level_def,
		create_level_def,
		update_level_def,
	} = app);

	const ac = get_ac();
	(window as any).audio = ac;

	const volume = get_volume();
	const instrument = get_instrument();

	let id: string;
	$: editing = $level_defs ? $level_defs.some((d) => d.id === id) : false;
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
	{#if $project_defs.length}
		<div class="column-sm">
			<Projects {app} />
			<section class="card">
				<div class="panel padded-md markup">
					<header>
						<h2>controls</h2>
					</header>
					<ControlsInstructions />
					<VolumeControl {volume} />
					<InstrumentControl {instrument} />
					<aside>earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
					<InitMidiButton {midi_access} />
				</div>
			</section>
		</div>
	{/if}
	<div class="column-sm">
		{#if $show_game_help}
			<section class="card" out:slide|local>
				<div class="panel padded-md">
					<div class="markup">
						<p>
							earbetter is an <a href="https://en.wikipedia.org/wiki/Ear_training">ear training</a> tool/game:
						</p>
						<ul>
							<li>each level is a standalone challenge</li>
							<li>
								your score is the sum of mistakes in your best {MISTAKE_HISTORY_LENGTH}
								runs, win a ★ at 0
							</li>
							<li>realms group levels into bigger challenges</li>
						</ul>
						<aside>
							earbetter is in early development, and many things are unfinished and unknown -
							feedback is appreciated on <a href="https://github.com/ryanatkn/earbetter"
								>the GitHub discussions and issues</a
							>
						</aside>
						<div class="centered-hz">
							<button style:margin="0" on:click={() => toggle_game_help()}>ok, hide this</button>
						</div>
					</div>
				</div>
			</section>
		{/if}
		<section class="card">
			<Realms {app} />
		</section>
		<RealmEditor {app} />
	</div>
	{#if $project_defs.length}
		<div class="column-sm">
			{#if $level_defs}
				<section class="card">
					<LevelMapItems {app} level_defs={$level_defs} />
				</section>
			{/if}
			{#if $selected_realm_id && (($editing_level && $level_defs) || $level_defs?.length === 0)}
				<section class="card">
					<div class="panel padded-md markup">
						<LevelDefForm
							{editing}
							bind:id
							level_def={$editing_level_def}
							on:submit={(editing ? update_level_def : create_level_def)
								? (e) => (editing ? update_level_def : create_level_def)(e.detail)
								: undefined}
							on:remove={(e) => remove_level_def(e.detail)}
						>
							<svelte:fragment slot="footer" let:changed let:to_data>
								{#if editing}
									<button
										type="button"
										on:click={() => {
											if (changed) update_level_def(to_data());
											play_level_def(id);
										}}
									>
										play!
									</button>
									<button type="button" on:click={() => edit_level_def(null)}>
										{#if changed}discard changes and stop editing{:else}stop editing this level{/if}
									</button>
								{/if}
							</svelte:fragment>
						</LevelDefForm>
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
