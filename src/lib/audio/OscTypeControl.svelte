<script lang="ts">
	import type {Writable} from 'svelte/store';

	import {osc_types} from '$lib/audio/helpers';

	export let osc_type: Writable<OscillatorType>;
</script>

<div class="osc-type-control">
	<label>
		<div class="title">osc_type</div>
		<select bind:value={$osc_type}>
			{#each osc_types as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</label>
</div>

<style>
	/* .osc-type-control {} */
</style>
