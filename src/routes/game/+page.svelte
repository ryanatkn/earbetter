<script lang="ts">
	import Earworm from '$lib/earworm/Earworm.svelte';
	import {set_audio_ctx} from '$lib/audio/audio_ctx';

	set_audio_ctx(); // allows components to do `const audio_ctx = useAudio_ctx();` which uses svelte's `getContext`
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
