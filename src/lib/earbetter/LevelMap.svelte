<script lang="ts">
	import * as s from '@fuzdev/fuz_schema/schema.ts';
	import { slide } from 'svelte/transition';
	import { BROWSER } from 'esm-env';

	import InitMidiButton from '../InitMidiButton.svelte';
	import LevelForm from './LevelForm.svelte';
	import Projects from './Projects.svelte';
	import VolumeControl from '../VolumeControl.svelte';
	import InstrumentControl from '../InstrumentControl.svelte';
	import { app_context } from './app.svelte.ts';
	import ControlsInstructions from './ControlsInstructions.svelte';
	import MidiInput from '../MidiInput.svelte';
	import Realms from './Realms.svelte';
	import { LevelData, MISTAKE_HISTORY_LENGTH } from './level.svelte.ts';
	import RealmEditor from './RealmEditor.svelte';
	import LevelMapItems from './LevelMapItems.svelte';
	import ProjectEditor from './ProjectEditor.svelte';

	const app = app_context.get();

	const {
		toggle_trainer_help,
		play_level,
		edit_level,
		remove_level,
		duplicate_level,
		create_level,
		update_level
	} = app;

	// TODO review the draft/editing data properties of `app`, some inconsistencies between levels/realms/projects
	const level_data = $derived(app.draft_level_data ?? s.parse_or_throw(LevelData, {}));

	const editing = $derived(app.levels ? app.levels.some((d) => d.id === level_data.id) : false);

	const no_realms = $derived(!app.realms?.length);
</script>

<MidiInput inputs={app.midi_inputs} onnotestart={app.start_note} onnotestop={app.stop_note} />
<div class="map">
	{#if app.project_datas.length}
		<div class="width_atmost_sm">
			{#if app.selected_project_data}
				<section class="card" transition:slide>
					<Projects />
				</section>
			{/if}
			<!-- TODO bug with eslint-plugin-svelte? -->
			<!-- eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -->
			{#if (app.editing_project && app.editing_project_data) || !app.selected_project_data}
				<section class="card" transition:slide>
					<ProjectEditor />
				</section>
			{/if}
			<section class="card" transition:slide>
				<div class="panel p_md">
					<header>
						<h2 class="my_0">controls</h2>
					</header>
					<ControlsInstructions />
					<div class="mb_lg">
						<VolumeControl bind:volume={app.volume} />
					</div>
					<InstrumentControl bind:instrument={app.instrument} />
					<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
					<InitMidiButton midi_state={app} />
				</div>
			</section>
		</div>
	{/if}
	<div class="width_atmost_sm">
		{#if BROWSER && app.show_trainer_help}
			<section class="card" transition:slide>
				<div class="panel p_md">
					<p>
						Earbetter is an <a href="https://wikipedia.org/wiki/Ear_training">ear training</a> tool:
					</p>
					<ul>
						<li>each level is a standalone challenge that's a series of trials</li>
						<li>
							your level score is the sum of mistakes in your best {MISTAKE_HISTORY_LENGTH} runs,
							win a ★ at 0
						</li>
						<li>realms group levels into bigger challenges</li>
						<li>projects group realms so you can customize various experiences</li>
						<li>levels can be shared via their links or exporting/importing data</li>
					</ul>
					<p>
						See also the 3 minute
						<a href="https://www.youtube.com/watch?v=zW2zI1A_Ikw">video intro on YouTube</a> and
						<a href="https://github.com/ryanatkn/earbetter">the readme</a>.
					</p>
					<aside>
						Earbetter is in early development, and many things are unfinished and unknown - feedback
						is appreciated on
						<a href="https://github.com/ryanatkn/earbetter">the GitHub discussions and issues</a>.
					</aside>
					<div class="box row">
						<button type="button" class="m_0" onclick={() => toggle_trainer_help()}>
							ok, hide this
						</button>
					</div>
				</div>
			</section>
		{/if}
		<section class="card">
			<Realms />
		</section>
		<!-- TODO bug probably with eslint-plugin-svelte or typescript-eslint -->
		<!-- eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -->
		{#if (app.editing_realm && app.editing_realm_data) || no_realms}
			<section class="card" transition:slide>
				<RealmEditor />
			</section>
		{/if}
	</div>
	{#if app.project_datas.length}
		<div class="width_atmost_sm">
			{#if app.levels}
				<section class="card" transition:slide>
					<LevelMapItems />
				</section>
			{/if}
			<!-- TODO bug, maybe in eslint-plugin-svelte? -->
			<!-- eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -->
			{#if app.selected_realm_id && ((app.editing_level && app.levels) || app.levels?.length === 0)}
				<!-- TODO transition only out, so we can scroll to it - but ideally we'd open a column to the right if there's space -->
				<section class="card" out:slide>
					<div class="panel p_md">
						<LevelForm
							{editing}
							{level_data}
							onsubmit={editing ? update_level : create_level}
							onremove={remove_level}
							onduplicate={duplicate_level}
							onplay={async (level_data, changed) => {
								if (changed) update_level(level_data);
								await play_level(level_data.id);
							}}
							onclose={() => edit_level(null)}
						/>
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
	.width_atmost_sm {
		margin: 0 var(--space_xl);
	}
	@media (max-width: 1111px) {
		.map {
			flex-direction: column;
			align-items: center;
		}
		.width_atmost_sm {
			margin-left: 0;
			margin-right: 0;
		}
	}
</style>
