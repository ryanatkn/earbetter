<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {MIDIAccess} from '$lib/audio/WebMIDI';
	import type {LevelDef} from '$lib/earbetter/level';
	import LevelMapItem from '$lib/earbetter/LevelMapItem.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import InitMidiButton from '$lib/audio/InitMidiButton.svelte';
	import LevelDefForm from '$lib/earbetter/LevelDefForm.svelte';
	import Projects from '$lib/earbetter/Projects.svelte';
	import VolumeControl from '$lib/audio/VolumeControl.svelte';
	import {get_instrument, get_volume} from '$lib/audio/helpers';
	import InstrumentControl from '$lib/audio/InstrumentControl.svelte';
	import type {App} from '$lib/earbetter/app';

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

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;

	const volume = get_volume();
	const instrument = get_instrument();

	// TODO this or props? currently both..?
	let set_level_def: (leve_def: LevelDef | null) => void;
	$: set_level_def?.($editing_level_def);

	let id: string;
	$: editing = $level_defs.some((d) => d.id === id);
</script>

<div class="map">
	<div>
		<section class="panel padded-md markup column-sm">
			<header>
				<h2>controls</h2>
			</header>
			<p>
				Earbetter does not yet function well on devices with smaller screens, see <a
					href="https://github.com/ryanatkn/earbetter/issues/2">issue #2</a
				>.
			</p>
			<table>
				<tr>
					<td><code>Spacebar</code></td>
					<td>replay trial</td>
				</tr>
				<tr>
					<td><code>r</code></td>
					<td>restart level</td>
				</tr>
				<tr>
					<td><code>Escape</code></td>
					<td>exit level</td>
				</tr>
				<tr>
					<td><code>1 to 4</code></td>
					<td>set instrument</td>
				</tr>
				<tr>
					<td><code>c</code></td>
					<td>connect MIDI</td>
				</tr>
				<tr>
					<td><code>up/down arrows</code></td>
					<td>adjust volume</td>
				</tr>
				<tr>
					<td><code>` Backtick</code></td>
					<td>cheat</td>
				</tr>
			</table>
			<VolumeControl {volume} />
			<InstrumentControl {instrument} />
			<p>
				Earbetter supports MIDI devices like piano keyboards. Connect a device and click the button
				below:
			</p>
			<InitMidiButton {midi_access} />
		</section>
		<section class="column-sm">
			<Projects {app} />
		</section>
	</div>
	<section class="panel padded-md column-sm">
		<header class="markup">
			<h2>ear training levels</h2>
		</header>
		<menu class="levels column-sm">
			{#each $level_defs as d (d.id)}
				<LevelMapItem {app} level_def={d} />
			{:else}
				this project has no levels
			{/each}
		</menu>
	</section>
	<section class="panel padded-md markup column-sm">
		<LevelDefForm
			{editing}
			bind:id
			bind:set_level_def
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
		padding: var(--spacing_md);
	}
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: var(--spacing_xl5) var(--spacing_xl);
	}
	@media (max-width: 1111px) {
		.map {
			flex-direction: column;
			align-items: center;
		}
		section {
			margin: var(--spacing_xl5) 0;
		}
	}
</style>
