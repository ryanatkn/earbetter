<script lang="ts">
	import Earbetter from '$lib/earbetter/Earbetter.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_app} from '$lib/earbetter/app';

	const app = get_app();
	if (app.active_level_data) app.active_level_data.value = null; // TODO hacky
</script>

<svelte:head>
	<title>Earbetter: game</title>
</svelte:head>

<main>
	<Earbetter {app}>
		<svelte:fragment slot="header"><Header /></svelte:fragment>
		<svelte:fragment slot="footer"><Footer /></svelte:fragment>
	</Earbetter>
</main>
