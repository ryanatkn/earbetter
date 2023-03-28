<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {Midi} from '$lib/music/midi';
	import {note_sets, to_notes, type NoteSet} from '$lib/music/helpers';

	export let notes: Signal<Set<Midi> | null>;
	export let value: NoteSet | undefined = undefined;

	$: console.log(`value`, value);
	$: value !== undefined && update_notes(value);

	const update_notes = (note_set: NoteSet): void => {
		console.log(`notes`, $notes);
		notes.value = note_set === 'chromatic' ? null : to_notes(note_set);
	};
</script>

<label>
	<div class="title">
		<slot>select notes</slot>
	</div>
	<select bind:value>
		{#each note_sets as note_set (note_set)}
			<option value={note_set}>{note_set}</option>
		{/each}
	</select>
</label>
