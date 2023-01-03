<script lang="ts">
	import Tuneup from '$lib/tuneup/Tuneup.svelte';
	import {setAudioCtx} from '$lib/audio/audioCtx';

	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
</script>

<main class="markup column">
	<section>
		<header class="centered-hz">
			<h1><a href="https://github.com/ryanatkn/tuneup">tuneup🎶</a></h1>
		</header>
	</section>
	<Tuneup />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}
	h1 {
		text-align: center;
	}
</style>
