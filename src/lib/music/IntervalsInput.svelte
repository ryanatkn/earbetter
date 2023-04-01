<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {Scale, scales, Semitones, to_scale_notes} from '$lib/music/music';

	const dispatch = createEventDispatcher<{input: Semitones[]}>();

	export let selected_scale: Scale = scales[0];
	export let octaves = 1;

	let intervals: Semitones[];
	$: intervals = to_scale_notes(selected_scale, octaves);
</script>

<label>
	<div class="title">scale</div>
	<select bind:value={selected_scale}>
		{#each scales as scale (scale)}
			<option value={scale}>{scale.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="title">octaves</div>
	{octaves}
	<input type="range" min={1} max={6} bind:value={octaves} />
</label>
<small class="preview column-sm panel">{intervals.join(', ')}</small>
<button type="button" on:click={() => dispatch('input', intervals)}> use this interval </button>

<style>
	.preview {
		padding: var(--spacing_md);
		margin-bottom: var(--spacing_lg);
		text-align: center;
		font-family: var(--font_family_mono);
	}
</style>
