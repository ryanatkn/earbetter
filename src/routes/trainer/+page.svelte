<script lang="ts">
	import {goto} from '$app/navigation';
	import {resolve} from '$app/paths';

	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {app_context} from '$lib/earbetter/app.svelte.js';
	import Level_Map from '$lib/earbetter/Level_Map.svelte';
	import Back_Button from '$routes/Back_Button.svelte';

	const app = app_context.get();
</script>

<svelte:head>
	<title>Earbetter trainer</title>
</svelte:head>

<main>
	<Back_Button onclick={() => goto(resolve('/'))} />
	<Header />
	<Level_Map {app} />
	<div class="box"><Footer /></div>
</main>
