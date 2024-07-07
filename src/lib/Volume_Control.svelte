<script lang="ts">
	import {DEFAULT_VOLUME, type Volume} from '$lib/audio_helpers.js';

	interface Props {
		volume: Volume;
	}

	// TODO add an `oninput` callback unless the `bind` restriction is lifted
	let {volume = $bindable(DEFAULT_VOLUME)}: Props = $props();

	// TODO @multiple see about using `bind:` below if the types are correct
</script>

<label class="text_align_center">
	<div class="title">volume</div>
	<input
		type="number"
		oninput={(e) => (volume = Number(e.currentTarget.value))}
		step={0.01}
		min={0}
		max={1}
		value={volume}
	/>
	<input
		type="range"
		oninput={(e) => (volume = Number(e.currentTarget.value))}
		step={0.01}
		min={0}
		max={1}
		value={volume}
	/>
</label>
