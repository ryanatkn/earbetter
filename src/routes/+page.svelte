<script lang="ts">
	import {base} from '$app/paths';

	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
</script>

<main>
	<Header />
	<section class="tagline panel">
		<p>ear training tools and JS/Svelte library for audio and music</p>
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
		margin-bottom: var(--space_xl3);
	}
	menu a {
		font-size: var(--size_xl3);
		padding: var(--space_xl);
	}
	.tagline {
		margin-top: var(--space_xl3);
		padding: var(--space_md);
	}
</style>
