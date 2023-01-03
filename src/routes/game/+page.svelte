<script lang="ts">
	import Earworm from '$lib/earworm/Earworm.svelte';
	import {setAudioCtx} from '$lib/audio/audioCtx';

	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
</script>

<main>
	<Earworm />
</main>

<style>
	main {
		width: 100%;
		height: 100%;
	}
</style>
