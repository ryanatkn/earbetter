<script lang="ts">
	import type {Signal} from '@preact/signals-core';

	import {instruments, type Instrument} from '$lib/audio_helpers.js';

	interface Props {
		instrument: Signal<Instrument>;
	}

	const {instrument}: Props = $props();

	// TODO BLOCK event callback or $bindable
	const input = (e: any) => (instrument.value = e.currentTarget.value);
</script>

<div class="mb_lg">
	<label class="text_align_center">
		<div class="title">instrument</div>
		<!-- TODO use `bind:value={$instrument}` when this PR is in: https://github.com/preactjs/signals/pull/325  -->
		<select value={$instrument} oninput={input}>
			{#each instruments as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</label>
</div>
