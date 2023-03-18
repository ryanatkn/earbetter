<script lang="ts">
	import Earworm from '$lib/earworm/Earworm.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
</script>

<svelte:head>
	<title>earworm: game</title>
</svelte:head>

<main>
	<Earworm>
		<svelte:fragment slot="header"><Header /></svelte:fragment>
		<svelte:fragment slot="footer"><Footer /></svelte:fragment>
	</Earworm>
</main>
