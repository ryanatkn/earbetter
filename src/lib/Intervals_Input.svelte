<script lang="ts">
	import {
		DEFAULT_SCALE,
		Intervals,
		lookup_scale,
		Scale,
		scales,
		to_scale_notes,
	} from '$lib/music.js';

	// TODO @multiple naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		scale?: Scale;
		octaves?: number;
		oninput?: (intervals: Intervals, scale: Scale, octaves: number) => void;
	}

	let {scale = $bindable(DEFAULT_SCALE), octaves = $bindable(1), oninput}: Props = $props();

	// TODO visualize the intervals with a piano
	const intervals: Intervals = $derived(to_scale_notes(scale, octaves));

	// TODO next UX: discard/use buttons where the latter gets disabled, and a cancel button if unchanged
</script>

<label>
	<div class="title text_align_center">scale</div>
	<!-- TODO bind the objects not the names to simplify -->
	<select value={scale.name} oninput={(e) => (scale = lookup_scale(e.currentTarget.value))}>
		{#each scales as s (s)}
			<option value={s.name}>{s.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="title text_align_center">octaves</div>
	<div class="text_align_center">{octaves}</div>
	<input type="range" min={1} max={6} bind:value={octaves} />
</label>
<small class="preview width_sm panel">{intervals.join(', ')}</small>
<button type="button" onclick={() => oninput?.(intervals, scale, octaves)}>
	use these intervals
</button>

<style>
	/* TODO this is hacky, extract or reuse something? */
	.preview {
		padding: var(--space_md);
		margin-bottom: var(--space_lg);
		text-align: center;
		font-family: var(--font_mono);
	}
</style>
