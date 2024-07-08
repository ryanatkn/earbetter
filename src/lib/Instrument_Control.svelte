<script lang="ts">
	import {instruments, type Instrument} from '$lib/audio_helpers.js';

	interface Props {
		instrument: Instrument;
	}

	let {instrument = $bindable()}: Props = $props();

	// TODO @many event callback or $bindable
</script>

<div class="mb_lg">
	<label class="text_align_center">
		<div class="title">instrument</div>
		<select bind:value={instrument}>
			{#each instruments as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</label>
</div>
