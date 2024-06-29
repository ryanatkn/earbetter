<script lang="ts">
	import {Intervals, Scale, scales, to_scale_notes} from '$lib/music.js';

	// TODO naming convention between `Intervals_Input` and `Select_Notes_Control`?

	interface Props {
		scale?: Scale;
		octaves?: number;
		oninput?: (intervals: Intervals) => void;
	}

	let {scale = $bindable(scales[0]), octaves = $bindable(1), oninput}: Props = $props(); // eslint-disable-line prefer-const

	const intervals: Intervals = $derived(to_scale_notes(scale, octaves));
</script>

<label>
	<div class="title">scale</div>
	<select bind:value={scale}>
		{#each scales as s (s)}
			<option value={s}>{s.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="title">octaves</div>
	{octaves}
	<input type="range" min={1} max={6} bind:value={octaves} />
</label>
<small class="preview width_sm panel">{intervals.join(', ')}</small>
<button type="button" onclick={() => oninput?.(intervals)}> use these intervals </button>

<style>
	/* TODO this is hacky, extract or reuse something? */
	.preview {
		padding: var(--space_md);
		margin-bottom: var(--space_lg);
		text-align: center;
		font-family: var(--font_mono);
	}
</style>
