<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Header from '#routes/Header.svelte';
	import Footer from '#routes/Footer.svelte';
	import { app_context } from '#lib/earbetter/app.svelte.ts';
	import LevelMap from '#lib/earbetter/LevelMap.svelte';
	import BackButton from '#routes/BackButton.svelte';

	const app = app_context.get();
</script>

<svelte:head>
	<title>Earbetter trainer</title>
</svelte:head>

<main>
	<BackButton onclick={() => goto(resolve('/'))} />
	<Header />
	<LevelMap {app} />
	<div class="box"><Footer /></div>
</main>
