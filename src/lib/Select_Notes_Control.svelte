<script lang="ts">
	import {
		scales,
		type Scale,
		pitch_classes,
		pitch_class_aliases,
		type Pitch_Class,
	} from '$lib/music.js';

	// TODO @multiple naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		scale: Scale;
		key: Pitch_Class;
	}

	let {scale = $bindable(), key = $bindable()}: Props = $props();

	// TODO BLOCK event callback or $bindable here and below
	const input_key = (e: Event & {currentTarget: HTMLSelectElement}) =>
		(key = e.currentTarget.value as Pitch_Class);
</script>

<label class="text_align_center">
	<div class="title">scale</div>
	<select bind:value={scale}>
		{#each scales as s (s)}
			<option value={s}>{s.name}</option>
		{/each}
	</select>
</label>
<label class="text_align_center">
	<div class="title">key</div>
	<select bind:value={key} oninput={input_key}>
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
