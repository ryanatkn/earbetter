<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import LevelMapItem from '$lib/earbetter/LevelMapItem.svelte';
	import {get_ac} from '$lib/audio/ac';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import LevelDefForm from '$lib/earbetter/LevelDefForm.svelte';
	import Projects from '$lib/earbetter/Projects.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import {get_instrument, get_volume} from '$lib/audio/helpers';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';
	import type {App} from '$lib/earbetter/app';
	import ControlsInstructions from '$lib/earbetter/ControlsInstructions.svelte';

	export let app: App;
	export let midi_access: Signal<MIDIAccess | null>;

	$: ({
		editing_level_def,
		level_defs,
		level_stats,
		play_level_def,
		edit_level_def,
		remove_level_def,
		create_level_def,
		update_level_def,
	} = app);

	$: ({stats} = level_stats);
	$: console.log('stats', $stats);

	$: console.log(`$level_defs`, $level_defs);

	const ac = get_ac();
	(window as any).audio = ac;

	const volume = get_volume();
	const instrument = get_instrument();

	let id: string;
	$: editing = $level_defs ? $level_defs.some((d) => d.id === id) : false;
</script>

<div class="map">
	{#if $level_defs}
		<div class="column-sm">
			<section class="panel padded-md markup">
				<header>
					<h2>controls</h2>
				</header>
				<ControlsInstructions />
				<VolumeControl {volume} />
				<InstrumentControl {instrument} />
				<p>
					Earbetter supports MIDI devices like piano keyboards. Connect a device and click the
					button below:
				</p>
				<InitMidiButton {midi_access} />
			</section>
			{#if $level_defs}
				<section>
					<Projects {app} />
				</section>
			{/if}
		</div>
	{/if}
	<div class="column-sm">
		{#if $level_defs}
			<section class="panel padded-md">
				<header class="markup">
					<h2>ear training levels</h2>
				</header>
				<menu class="levels">
					{#each $level_defs as d (d.id)}
						<LevelMapItem {app} level_def={d} />
					{/each}
				</menu>
			</section>
		{:else}
			<Projects {app} />
		{/if}
	</div>
	{#if $level_defs}
		<div class="column-sm">
			<section class="panel padded-md markup">
				<LevelDefForm
					{editing}
					bind:id
					level_def={$editing_level_def}
					on:submit={(editing ? update_level_def : create_level_def)
						? (e) => (editing ? update_level_def : create_level_def)(e.detail)
						: undefined}
					on:remove={(e) => remove_level_def(e.detail)}
				>
					<svelte:fragment slot="footer" let:changed>
						{#if editing}
							<button type="button" on:click={() => play_level_def(id)}> play! </button>
							<button type="button" on:click={() => edit_level_def(null)}>
								{#if changed}discard changes and stop editing{:else}stop editing this level{/if}
							</button>
						{/if}
					</svelte:fragment>
				</LevelDefForm>
			</section>
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
	.levels {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin: var(--spacing_md) 0;
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.column-sm {
		margin: 0 var(--spacing_xl) var(--spacing_xl5);
	}
	section:not(:first-child) {
		margin: var(--spacing_xl5) 0;
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
