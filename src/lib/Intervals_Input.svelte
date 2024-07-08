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
	const intervals_from_scale_and_octave = $derived(to_scale_notes(scale, octaves));
	const serialized_intervals_from_scale_and_octave = $derived(
		serialize_intervals(intervals_from_scale_and_octave),
	);

	const serialized_intervals = $state(serialize_intervals(intervals));
	let input_intervals_str = $state(serialized_intervals);

	// TODO maybe on init, we should figure out a way to use the intervals from the scale and octave when appropriate, but I can't think of when that is right now
	// The order here matters, on init we want the prop intervals to be the source of truth.
	const last_time_intervals_from_scale_and_octave_changed = $derived.by(() => {
		intervals_from_scale_and_octave;
		return Date.now();
	});
	const last_time_intervals_changed = $derived.by(() => {
		intervals;
		return Date.now();
	});

	const current_str = $derived(
		last_time_intervals_changed >= last_time_intervals_from_scale_and_octave_changed
			? input_intervals_str
			: serialized_intervals_from_scale_and_octave,
	);
	const current_intervals = $derived(parse_intervals(current_str));

	const changed = $derived(!dequal(intervals, current_intervals));
	const valid = $derived(!!current_intervals.length);
</script>

<small
	><textarea
		value={current_str}
		oninput={(e) => (input_intervals_str = e.currentTarget.value)}
		class="preview width_sm panel"
	></textarea></small
>
<button
	type="button"
	class="mb_lg"
	disabled={!changed || !valid}
	onclick={() => oninput?.(current_intervals, scale, octaves)}
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
