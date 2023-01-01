<script lang="ts">
	import Earworm from '$lib/earworm/Earworm.svelte';
	import {setAudioCtx} from '$lib/audio/audioCtx';

	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
</script>

<main class="markup column">
	<section>
		<header class="centered-hz">
			<h1><a href="https://github.com/ryanatkn/earworm">earworm🪱</a></h1>
		</header>
	</section>
	<Earworm />
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
