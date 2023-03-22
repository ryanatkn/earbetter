<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import type {Volume} from '$lib/audio/helpers';

	export let volume: Signal<Volume>;

	// TODO use bind:value when signals adds `set`
</script>

<div class="volume-control">
	<label>
		<div class="title">volume</div>
		<input
			type="number"
			on:input={(e) => (volume.value = Number(e.currentTarget.value))}
			value={$volume}
			step={0.01}
			min={0}
			max={1}
		/>
		<input
			type="range"
			on:input={(e) => (volume.value = Number(e.currentTarget.value))}
			value={$volume}
			step={0.01}
			min={0}
			max={1}
		/>
	</label>
</div>

<style>
	/* .volume-control {} */
</style>
