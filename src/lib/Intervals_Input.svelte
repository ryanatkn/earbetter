<script lang="ts">
	import {Intervals, Scale, scales, to_scale_notes} from '$lib/music.js';

	// TODO @multiple naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		scale?: Scale;
		octaves?: number;
		onscale?: (scale: Scale) => void;
		onoctaves?: (octaves: number) => void;
		oninput?: (intervals: Intervals, scale: Scale, octaves: number) => void;
	}

	const {scale = scales[0], octaves = 1, onscale, onoctaves, oninput}: Props = $props();

	let updated_scale: Scale = $state.frozen(scale);

	let updated_octaves: number = $state(octaves);

	// TODO visualize the intervals with a piano
	const intervals: Intervals = $derived(to_scale_notes(updated_scale, updated_octaves));

	// TODO hacky
	$effect(() => {
		updated_scale = scale;
	});
	$effect(() => {
		updated_octaves = octaves;
	});
	// TODO hacky, could use oninput handlers but
	// the scale select needs to wait a tick to get `updated_scale`,
	// unlike the octave range input, maybe a bug?
	$effect(() => {
		if (scale !== updated_scale) {
			console.log('onscale', updated_scale);
			onscale?.(updated_scale);
		}
		if (octaves !== updated_octaves) {
			console.log('onoctaves', updated_octaves);
			onoctaves?.(updated_octaves);
		}
	});
</script>

<label>
	<div class="title text_align_center">scale</div>
	<select bind:value={updated_scale}>
		{#each scales as s (s)}
			<option value={s}>{s.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="title text_align_center">octaves</div>
	<div class="text_align_center">{updated_octaves}</div>
	<input type="range" min={1} max={6} bind:value={updated_octaves} />
</label>
<small class="preview width_sm panel">{intervals.join(', ')}</small>
<button type="button" onclick={() => oninput?.(intervals, updated_scale, updated_octaves)}>
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
