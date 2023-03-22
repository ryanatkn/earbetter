<script lang="ts">
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import WebsiteMap from '$routes/WebsiteMap.svelte';
</script>

<svelte:head>
	<title>earbetter</title>
</svelte:head>
<main>
	<Header />
	<WebsiteMap />
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
