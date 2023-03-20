<script lang="ts">
	import {base} from '$app/paths';

	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {pages} from '$routes/nav';
</script>

<svelte:head>
	<title>earbetter</title>
</svelte:head>
<main>
	<Header />
	<nav>
		<menu>
			{#each pages as page (page.slug)}
				<li><a class="panel" href="{base}{page.slug}">{page.slug}</a></li>
			{/each}
		</menu>
	</nav>
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
		margin-bottom: var(--spacing_md);
	}
	menu a {
		font-size: var(--font_size_xl);
		padding: var(--spacing_xl);
	}
	li {
		flex-direction: column;
	}
</style>
