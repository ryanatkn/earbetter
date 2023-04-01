<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import {
		scales,
		type Scale,
		pitch_classes,
		pitch_class_aliases,
		type PitchClass,
		lookup_scale,
	} from '$lib/music/music';

	export let scale: Signal<Scale>;
	export let key: Signal<PitchClass>;

	const input_key = (e: Event & {currentTarget: HTMLSelectElement}) =>
		(key.value = e.currentTarget.value as PitchClass);
</script>

<label>
	<div class="title">
		<slot>scale</slot>
	</div>
	<select
		value={$scale.name}
		on:change={(e) => (scale.value = lookup_scale(e.currentTarget.value))}
	>
		{#each scales as s (s)}
			<option value={s.name}>{s.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="key">
		<slot>key</slot>
	</div>
	<select value={$key} on:input={input_key}>
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
