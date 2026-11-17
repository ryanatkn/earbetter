<script lang="ts">
	import {
		scales,
		type Scale,
		pitch_classes,
		pitch_class_aliases,
		type PitchClass,
		lookup_scale
	} from './music.ts';

	// TODO @many naming convention between `IntervalsInput`/`NotesInput`/`SelectNotesControl`?

	interface Props {
		scale: Scale;
		key: PitchClass;
	}

	let { scale = $bindable(), key = $bindable() }: Props = $props();

	// TODO @many event callback or $bindable here and below
</script>

<label class="text-align:center">
	<div class="title">scale</div>
	<!-- TODO bind the objects not the names to simplify -->
	<select value={scale.name} oninput={(e) => (scale = lookup_scale(e.currentTarget.value))}>
		{#each scales as s (s)}
			<option value={s.name}>{s.name}</option>
		{/each}
	</select>
</label>
<label class="text-align:center">
	<div class="title">key</div>
	<select bind:value={key}>
		{#each pitch_classes as p (p)}
			<option value={p}>
				{p}{#if p in pitch_class_aliases}/{pitch_class_aliases[p]}{/if}
			</option>
		{/each}
	</select>
</label>

<style>
	label {
		flex: 1;
	}
</style>
