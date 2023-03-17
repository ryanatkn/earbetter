<script lang="ts">
	import type {Writable} from 'svelte/store';

	export let volume: Writable<number>;
</script>

<div class="volume-control">
	<label>
		volume
		<input type="number" bind:value={$volume} step={0.01} min={0} max={1} />
		<input type="range" bind:value={$volume} step={0.01} min={0} max={1} />
	</label>
</div>

<style>
	/* .volume-control {} */
</style>
