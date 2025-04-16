<script lang="ts">
	import {DEFAULT_VOLUME, type Volume} from '$lib/audio_helpers.js';

	interface Props {
		volume: Volume;
	}

	// TODO add an `oninput` callback unless the `bind` restriction is lifted
	let {volume = $bindable(DEFAULT_VOLUME)}: Props = $props();
</script>

<label class="text_align_center">
	<div class="title">volume</div>
	<div class="row">
		<input type="number" bind:value={volume} step={0.01} min={0} max={1} />
		<input type="range" bind:value={volume} step={0.01} min={0} max={1} />
	</div>
</label>

<style>
	input[type='number'] {
		width: 75px;
		max-width: 75px;
	}
</style>
