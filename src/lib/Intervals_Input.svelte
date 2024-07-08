<script lang="ts">
	import {dequal} from 'dequal';

	import {
		DEFAULT_SCALE,
		Intervals,
		lookup_scale,
		parse_intervals,
		Scale,
		scales,
		serialize_intervals,
		to_scale_notes,
	} from '$lib/music.js';

	// TODO @multiple naming convention between `Intervals_Input`/`Notes_Input`/`Select_Notes_Control`?

	interface Props {
		intervals: Intervals;
		scale?: Scale;
		octaves?: number;
		oninput?: (intervals: Intervals, scale: Scale, octaves: number) => void;
	}

	let {
		intervals,
		scale = $bindable(DEFAULT_SCALE),
		octaves = $bindable(1),
		oninput,
	}: Props = $props();

	// TODO visualize the intervals with a piano
	const updated_intervals: Intervals = $derived(to_scale_notes(scale, octaves));

	// TODO extract helpers

	let input_intervals_str = $state(serialize_intervals(intervals));
	const parsed_input_intervals = $derived(parse_intervals(input_intervals_str));

	const changed = $derived(!dequal(intervals, parsed_input_intervals));
	const valid = $derived(!!parsed_input_intervals.length);

	// TODO next UX: discard/use buttons where the latter gets disabled, and a cancel button if unchanged
</script>

<small
	><textarea
		value={input_intervals_str}
		oninput={(e) => (input_intervals_str = e.currentTarget.value)}
		class="preview width_sm panel"
	></textarea></small
>
<button
	type="button"
	class="mb_lg"
	disabled={!changed || !valid}
	onclick={() => oninput?.(parse_intervals(input_intervals_str), scale, octaves)}
>
	use these intervals
</button>
<label>
	<div class="title text_align_center">scale</div>
	<!-- TODO bind the objects not the names to simplify -->
	<select value={scale.name} onchange={(e) => (scale = lookup_scale(e.currentTarget.value))}>
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

<style>
	/* TODO this is hacky, extract or reuse something? */
	.preview {
		padding: var(--space_md);
		margin: var(--space_lg) 0;
		font-family: var(--font_mono);
	}
</style>
