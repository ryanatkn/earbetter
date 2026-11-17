<script lang="ts">
	import { deep_equal } from '@fuzdev/fuz_util/deep_equal.ts';

	import {
		DEFAULT_SCALE,
		Intervals,
		lookup_scale,
		parse_intervals,
		Scale,
		scales,
		serialize_intervals,
		to_scale_notes
	} from './music.ts';

	// TODO @many naming convention between `IntervalsInput`/`NotesInput`/`SelectNotesControl`?

	interface Props {
		intervals: Intervals; // TODO maybe make bindable? gets tricky because of the 2 sources of truth
		scale?: Scale;
		octaves?: number;
		oninput?: (intervals: Intervals, from?: { scale: Scale; octaves: number }) => void;
	}

	let {
		intervals,
		scale = $bindable(DEFAULT_SCALE),
		octaves = $bindable(1),
		oninput
	}: Props = $props();

	// TODO visualize the intervals with a piano

	/**
	 * The textarea's text and where it came from. The textarea shares two sources of truth:
	 * the `intervals` prop, which resets it, and the scale and octaves, which overwrite it when changed.
	 */
	let current: { str: string; from_scale: boolean } = $derived({
		str: serialize_intervals(intervals),
		from_scale: false
	});
	const use_scale = (): void => {
		current = { str: serialize_intervals(to_scale_notes(scale, octaves)), from_scale: true };
	};

	const current_intervals = $derived(parse_intervals(current.str));

	const changed = $derived(!deep_equal(intervals, current_intervals));
	const valid = $derived(!!current_intervals.length);
</script>

<small>
	<textarea
		value={current.str}
		oninput={(e) => (current = { str: e.currentTarget.value, from_scale: false })}
		class="preview width_atmost_sm panel"></textarea>
</small>
<button
	type="button"
	class="accent mb_lg"
	disabled={!changed || !valid}
	onclick={() => oninput?.(current_intervals, current.from_scale ? { scale, octaves } : undefined)}
>
	use these intervals
</button>
<label>
	<div class="title text-align:center">scale</div>
	<!-- TODO bind the objects not the names to simplify -->
	<select
		value={scale.name}
		onchange={(e) => {
			scale = lookup_scale(e.currentTarget.value);
			use_scale();
		}}
	>
		{#each scales as s (s)}
			<option value={s.name}>{s.name}</option>
		{/each}
	</select>
</label>
<label>
	<div class="title text-align:center">octaves</div>
	<div class="text-align:center">{octaves}</div>
	<input
		type="range"
		min={1}
		max={6}
		bind:value={
			() => octaves,
			(v) => {
				octaves = v;
				use_scale();
			}
		}
	/>
</label>

<style>
	/* TODO this is hacky, extract or reuse something? */
	.preview {
		padding: var(--space_md);
		margin: var(--space_lg) 0;
		font-family: var(--font_family_mono);
	}
</style>
