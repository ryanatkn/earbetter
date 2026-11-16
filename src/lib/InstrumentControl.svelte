<script lang="ts">
	import { instruments, type Instrument } from './audio_helpers.ts';

	interface Props {
		instrument: Instrument;
	}

	let { instrument = $bindable() }: Props = $props();

	// TODO @many event callback or $bindable
</script>

<div class="mb_lg">
	<label class="text-align:center">
		<div class="title">instrument</div>
		<select bind:value={instrument}>
			{#each instruments as v (v)}
				<option value={v}>{v}</option>
			{/each}
		</select>
	</label>
</div>
