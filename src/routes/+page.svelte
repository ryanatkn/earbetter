<script lang="ts">
	import {resolve} from '$app/paths';

	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
</script>

<main>
	<Header />
	<section class="tagline panel text_align_center">
		<p>ear trainer and tools for<br />playing and programming music and audio</p>
	</section>
	<section>
		<nav>
			<ul class="unstyled">
				<li><a class="panel" href={resolve('/trainer')}>train your ear!</a></li>
				<li><a class="panel" href={resolve('/piano')}>play piano!</a></li>
			</ul>
		</nav>
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
	ul {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	ul li:not(:last-child) {
		margin-bottom: var(--space_xl5);
	}
	ul a {
		font-size: var(--font_size_xl3);
		padding: var(--space_xl);
	}
	.tagline {
		margin-top: var(--space_xl3);
		padding: var(--space_md);
	}
</style>
