<script lang="ts">
	import { PULSE_RATE_MAX, PULSE_RATE_MIN, type PulseRate } from './pulse.ts';

	interface Props {
		rate: PulseRate;
	}

	// TODO @many event callback or $bindable
	let { rate = $bindable() }: Props = $props();
</script>

<label class="text-align:center">
	<div class="title">rate (Hz)</div>
	<div class="row">
		<input type="number" bind:value={rate} step={0.1} min={PULSE_RATE_MIN} max={PULSE_RATE_MAX} />
		<input type="range" bind:value={rate} step={1} min={PULSE_RATE_MIN} max={PULSE_RATE_MAX} />
	</div>
</label>

<style>
	/* TODO @many same as `VolumeControl`, extract or use a token */
	input[type='number'] {
		width: 75px;
		max-width: 75px;
	}
</style>
