<script lang="ts">
	import Earbetter from '$lib/earbetter/Earbetter.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_app} from '$lib/earbetter/app.js';

	const app = get_app();
	app.clear_active_level();
</script>

<svelte:head>
	<title>Earbetter: game</title>
</svelte:head>

<main>
	<Header />
	<Earbetter {app} />
	<div class="box"><Footer /></div>
</main>
