<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {Volume} from '$lib/audio_helpers.js';

	interface Props {
		volume: Signal<Volume>;
	}

	const {volume}: Props = $props();

	// TODO use bind:value when signals adds `set`
</script>

<label class="text_align_center">
	<div class="title">volume</div>
	<input
		type="number"
		oninput={(e) => (volume.value = Number(e.currentTarget.value))}
		step={0.01}
		min={0}
		max={1}
		value={$volume}
	/>
	<input
		type="range"
		oninput={(e) => (volume.value = Number(e.currentTarget.value))}
		step={0.01}
		min={0}
		max={1}
		value={$volume}
	/>
</label>
