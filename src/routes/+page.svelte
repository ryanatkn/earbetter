<script lang="ts">
	import {base} from '$app/paths';

	import {setAudioCtx} from '$lib/audio/audioCtx';

	setAudioCtx(); // allows components to do `const audioCtx = useAudioCtx();` which uses svelte's `getContext`
</script>

<main class="column">
	<section>
		<header class="centered-hz">
			<h1>earworm</h1>
			<div class="icons">🪱🎶</div>
		</header>
	</section>
	<menu>
		<li><a class="panel" href="{base}/game">play the game!</a></li>
		<li><a class="panel" href="{base}/piano">play piano!</a></li>
	</menu>
	<footer>
		<div>public domain</div>
		<a href="https://github.com/ryanatkn/earworm">source code on GitHub</a>
	</footer>
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
		margin-bottom: var(--spacing_xl5);
	}
	menu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	menu li:not(:last-child) {
		margin-bottom: var(--spacing_xl3);
	}
	menu a {
		font-size: var(--font_size_xl3);
		padding: var(--spacing_xl);
	}
	.icons {
		font-size: var(--font_size_xl5);
	}
	footer {
		margin: var(--spacing_xl5) 0;
		text-align: center;
	}
</style>
