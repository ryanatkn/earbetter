<script lang="ts">
	import type {Writable} from 'svelte/store';

	import {instruments} from '$lib/audio/helpers';

	export let instrument: Writable<OscillatorType>;
</script>

<div class="osc-type-control">
	<label>
		<div class="title">instrument</div>
		<select bind:value={$instrument}>
			{#each instruments as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</label>
</div>

<style>
	/* .osc-type-control {} */
</style>
