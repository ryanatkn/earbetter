<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import {
		scales,
		type Scale,
		pitch_classes,
		pitch_class_aliases,
		type Pitch_Class,
		lookup_scale,
	} from '$lib/music.js';

	// TODO @multiple naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		scale: Signal<Scale>;
		key: Signal<Pitch_Class>;
	}

	const {scale, key}: Props = $props();

	const input_key = (e: Event & {currentTarget: HTMLSelectElement}) =>
		(key.value = e.currentTarget.value as Pitch_Class);
</script>

<label class="text_align_center">
	<div class="title">scale</div>
	<!-- TODO use `bind:value={$scale}` when this PR is in: https://github.com/preactjs/signals/pull/325  -->
	<select value={$scale.name} onchange={(e) => (scale.value = lookup_scale(e.currentTarget.value))}>
		{#each scales as s (s)}
			<option value={s.name}>{s.name}</option>
		{/each}
	</select>
</label>
<label class="text_align_center">
	<div class="title">key</div>
	<!-- TODO use `bind:value={$key}` when this PR is in: https://github.com/preactjs/signals/pull/325  -->
	<select value={$key} oninput={input_key}>
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
