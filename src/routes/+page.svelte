<script lang="ts">
	import {base} from '$app/paths';

	import Earworm from '$lib/earworm/Earworm.svelte';
	import {setAudioCtx} from '$lib/audio/audioCtx';

	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
</script>

<main class="markup column">
	<section>
		<header class="centered-hz">
			<h1>earworm🪱🎶</h1>
			<div><a href="https://github.com/ryanatkn/earworm">source</a></div>
		</header>
	</section>
	<a class="play-link panel" href="{base}/game">play the game!</a>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}
	header {
		text-align: center;
		display: flex;
		flex-direction: column;
	}
	.play-link {
		font-size: var(--font_size_xl3);
		padding: var(--spacing_xl);
	}
</style>
