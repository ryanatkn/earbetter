<script lang="ts">
	import {createEventDispatcher} from 'svelte';

	import {Intervals, Scale, scales, to_scale_notes} from '$lib/music.js';

	// TODO naming convention between `Intervals_Input` and `Select_Notes_Control`?

	const dispatch = createEventDispatcher<{input: Intervals}>();

	export let selected_scale: Scale = scales[0];
	export let octaves = 1;

	let intervals: Intervals;
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
<small class="preview width_sm panel">{intervals.join(', ')}</small>
<button type="button" onclick={() => dispatch('input', intervals)}> use these intervals </button>

<style>
	/* TODO this is hacky, extract or reuse something? */
	.preview {
		padding: var(--space_md);
		margin-bottom: var(--space_lg);
		text-align: center;
		font-family: var(--font_mono);
	}
</style>
