<script lang="ts">
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import LevelMap from '$lib/earworm/LevelMap.svelte';
	import {level_defs} from '$lib/earworm/level_defs';
	import type {LevelDef, LevelId} from '$lib/earworm/level';
	import {create_level_stats} from '$lib/earworm/level_stats';
	import Level from '$lib/earworm/Level.svelte';
	import {get_audio_ctx} from '$lib/audio/audio_ctx';
	import MidiInput from '$lib/audio/MidiInput.svelte';

	export let default_level_defs = level_defs; // is a bit awkward, doing it this way to allow custom games, and removing both kinds
	export let active_level_def: LevelDef | null = null;
	export let editing_level_def: LevelDef | null = null;

	let custom_level_defs: LevelDef[] = [];
	$: all_level_defs = default_level_defs.concat(custom_level_defs);
	$: console.log(`all_level_defs`, all_level_defs);

	const level_stats = create_level_stats(default_level_defs);
	$: console.log('stats', $level_stats);
	console.log($level_stats);

	const audio_ctx = get_audio_ctx();
	(window as any).audio = audio_ctx;

	let midi_input: MidiInput;

	const select_level_def = async (id: LevelId): Promise<void> => {
		const level_def = all_level_defs.find((d) => d.id === id);
		if (!level_def) {
			console.error('cannot find level_def with id', id);
			return;
		}
		void audio_ctx.resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `select_level_def` is called without a user action
		await goto(`${base}/game/play#` + encodeURIComponent(JSON.stringify(level_def)));
	};

	const edit_level_def = (level_def: LevelDef | null): void => {
		if (level_def === null) {
			editing_level_def = null;
			console.log(`editing_level_def`, editing_level_def);
			return;
		}
		editing_level_def = level_def;
		const el = document.getElementsByClassName('level-def-form').item(0); // TODO hacky
		if (el) window.scrollTo({top: el.getBoundingClientRect().y, behavior: 'smooth'});
	};

	const remove_level_def = (id: LevelId): void => {
		const level_def = all_level_defs.find((d) => d.id === id);
		if (!level_def) {
			console.error('cannot find level_def with id', id);
			return;
		}
		if (default_level_defs.includes(level_def)) {
			default_level_defs = default_level_defs.filter((d) => d !== level_def);
		} else {
			custom_level_defs = custom_level_defs.filter((d) => d !== level_def);
		}
		// TODO BLOCK this is breaking
	};

	const create_level_def = (level_def: LevelDef): void => {
		custom_level_defs = custom_level_defs.concat(level_def);
		editing_level_def = level_def;
	};

	const update_level_def = (level_def: LevelDef): void => {
		const {id} = level_def;
		// TODO this is trickier than it should be because of the two collections
		let index = default_level_defs.findIndex((d) => d.id === id);
		const update_defs = (ds: LevelDef[]): LevelDef[] => {
			const updated = ds.slice();
			updated.splice(index, 1, level_def);
			return updated;
		};
		if (index === -1) {
			index = custom_level_defs.findIndex((d) => d.id === id);
			if (index === -1) {
				console.error('cannot find level def to update', level_def);
				return;
			} else {
				custom_level_defs = update_defs(custom_level_defs);
			}
		} else {
			default_level_defs = update_defs(default_level_defs);
		}
		editing_level_def = level_def;
	};

	const exit_level_to_map = async (success = false): Promise<void> => {
		if (!active_level_def) return;
		if (success) {
			level_stats.register_success(active_level_def.id);
		}
		active_level_def = null;
		await goto('#');
	};
</script>

<MidiInput bind:this={midi_input} />
{#if active_level_def}
	<div class="level">
		<Level level_def={active_level_def} {exit_level_to_map} />
	</div>
{:else}
	<slot name="header" />
	<LevelMap
		{midi_input}
		level_defs={all_level_defs}
		level_def={editing_level_def}
		{select_level_def}
		{edit_level_def}
		{remove_level_def}
		{create_level_def}
		{update_level_def}
	/>
	<slot name="footer" />
{/if}

<style>
	:global(html, body) {
		width: 100%;
		height: 100%;
	}

	.level {
		width: 100%;
		height: 100%;
	}
</style>
