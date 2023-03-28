<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {Midi} from '$lib/music/midi';
	import {scales, to_notes, type Scale} from '$lib/music/helpers';

	export let notes: Signal<Set<Midi> | null>;
	export let value: Scale | undefined = undefined;

	$: value !== undefined && update_notes(value);

	const update_notes = (scale: Scale): void => {
		console.log(`notes`, $notes, scale);
		notes.value = scale.name === 'chromatic' ? null : to_notes(scale);
	};
</script>

<label>
	<div class="title">
		<slot>select notes</slot>
	</div>
	<select bind:value>
		{#each scales as scale (scale)}
			<option value={scale}>{scale.name}</option>
		{/each}
	</select>
</label>
