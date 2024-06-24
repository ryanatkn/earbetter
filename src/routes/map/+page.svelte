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
		margin-top: var(--space_xl3);
	}
	/* TODO hacky */
	.width_sm :global(.section_title) {
		border-top-left-radius: var(--radius_sm);
		border-top-right-radius: var(--radius_sm);
	}
</style>
