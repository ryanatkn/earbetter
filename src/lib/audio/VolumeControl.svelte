<script lang="ts">
	import type {Writable} from 'svelte/store';

	import type {Volume} from '$lib/audio/helpers';

	export let volume: Writable<Volume>;
</script>

<div class="volume-control">
	<label>
		<div class="title">volume</div>
		<input type="number" bind:value={$volume} step={0.01} min={0} max={1} />
		<input type="range" bind:value={$volume} step={0.01} min={0} max={1} />
	</label>
</div>

<style>
	/* .volume-control {} */
</style>
