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
	<SiteMap />
	<Footer />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}
</style>
