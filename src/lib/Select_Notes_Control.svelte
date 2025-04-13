<script lang="ts">
	import {
		scales,
		type Scale,
		pitch_classes,
		pitch_class_aliases,
		type Pitch_Class,
		lookup_scale,
	} from '$lib/music.js';

	// TODO @many naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		scale: Scale;
		key: Pitch_Class;
	}

	let {scale = $bindable(), key = $bindable()}: Props = $props();

	// $inspect('scale', scale);

	// TODO @many event callback or $bindable here and below
</script>

<label class="text_align_center">
	<div class="title">scale</div>
	<!-- TODO bind the objects not the names to simplify -->
	<select value={scale.name} oninput={(e) => (scale = lookup_scale(e.currentTarget.value))}>
		{#each scales as s (s)}
			<option value={s.name}>{s.name}</option>
		{/each}
	</select>
</label>
<label class="text_align_center">
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
