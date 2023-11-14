<script lang="ts">
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import SiteMap from '$routes/SiteMap.svelte';
</script>

<svelte:head>
	<title>Earbetter</title>
</svelte:head>
<main>
	<Header />
	<div class="width_sm panel">
		<SiteMap />
	</div>
	<Footer />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}
	.width_sm {
		margin-top: var(--spacing_3);
	}
	/* TODO hacky */
	.width_sm :global(.section-title) {
		border-top-left-radius: var(--border_radius_sm);
		border-top-right-radius: var(--border_radius_sm);
	}
</style>
