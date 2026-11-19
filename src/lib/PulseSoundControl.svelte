<script lang="ts">
	import { pulse_sounds, type PulseSound } from './pulse.ts';

	interface Props {
		sound: PulseSound;
	}

	// TODO @many event callback or $bindable
	let { sound = $bindable() }: Props = $props();
</script>

<label class="text-align:center">
	<div class="title">sound</div>
	<select bind:value={sound}>
		{#each pulse_sounds as v (v)}
			<option value={v}>{v.replaceAll('_', ' ')}</option>
		{/each}
	</select>
</label>
