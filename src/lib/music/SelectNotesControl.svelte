<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {Midi} from '$lib/music/midi';
	import {scales, to_notes, type Scale} from '$lib/music/helpers';
	import {pitch_classes, pitch_class_aliases, type PitchClass} from '$lib/music/notes';

	// TODO BLOCK how to source this from the metadata?
	export let notes: Signal<Set<Midi> | null>;
	export let scale: Scale | undefined = undefined;
	export let key: PitchClass | undefined = undefined;

	$: scale !== undefined && key !== undefined && update_notes(scale, key);

	const update_notes = (scale: Scale, key: PitchClass): void => {
		console.log(`notes`, $notes, scale);
		notes.value = scale.name === 'chromatic' ? null : to_notes(scale, key);
	};
</script>

<label>
	<div class="title">
		<slot>scale</slot>
	</div>
	<select bind:value={scale}>
		{#each scales as scale (scale)}
			<option value={scale}>{scale.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="key">
		<slot>key</slot>
	</div>
	<select bind:value={key}>
		{#each pitch_classes as p (p)}
			<option value={p}
				>{p}{#if p in pitch_class_aliases}/{pitch_class_aliases[p]}{/if}</option
			>
		{/each}
	</select>
</label>

<style>
	label {
		flex: 1;
	}
</style>
