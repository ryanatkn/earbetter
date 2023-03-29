<script lang="ts">
	import {base} from '$app/paths';

	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
</script>

<main>
	<Header />
	<section class="tagline panel">
		<p>ear training game and tools for playing and programming music and audio</p>
	</section>
	<section>
		<menu>
			<li><a class="panel" href="{base}/game">play the game!</a></li>
			<li><a class="panel" href="{base}/piano">play piano!</a></li>
		</menu>
	</section>
	<Footer />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
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
	.tagline {
		margin-top: var(--spacing_xl3);
		padding: var(--spacing_md);
	}
</style>
