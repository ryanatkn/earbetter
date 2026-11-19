<script lang="ts">
	import { midi_names, midi_to_freq } from './music.ts';
	import { PULSE_PITCH_MAX, PULSE_PITCH_MIN, type PulsePitch } from './pulse.ts';

	interface Props {
		pitch: PulsePitch;
		/**
		 * For when the pitch has no effect, like with a sound that isn't made from a tone.
		 */
		disabled?: boolean;
	}

	// TODO @many event callback or $bindable
	let { pitch = $bindable(), disabled = false }: Props = $props();
</script>

<label class="text-align:center" class:disabled>
	<div class="title">pitch</div>
	<div class="row">
		<div class="note" title="{Math.round(midi_to_freq(pitch))} Hz">{midi_names[pitch]}</div>
		<input
			type="range"
			bind:value={pitch}
			step={1}
			min={PULSE_PITCH_MIN}
			max={PULSE_PITCH_MAX}
			{disabled}
		/>
	</div>
</label>

<style>
	/* TODO @many same width as the number inputs of `VolumeControl`, extract or use a token */
	.note {
		width: 75px;
		min-width: 75px;
	}
</style>
