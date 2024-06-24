<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import {instruments, type Instrument} from '$lib/helpers.js';

	interface Props {
		instrument: Signal<Instrument>;
	}

	const {instrument}: Props = $props();

	// TODO remove after signals adds `set` so we can use two-way binding
	const input = (e: any) => (instrument.value = e.currentTarget.value);
</script>

<div class="instrument-control mb_lg">
	<label>
		<div class="title">instrument</div>
		<!-- TODO use `bind:value={$instrument}` when this PR is in: https://github.com/preactjs/signals/pull/325  -->
		<select value={$instrument} oninput={input}>
			{#each instruments as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</label>
</div>

<style>
	/* .instrument-control {} */
</style>
