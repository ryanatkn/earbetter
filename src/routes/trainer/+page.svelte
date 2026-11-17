<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import Header from '#routes/Header.svelte';
	import Footer from '#routes/Footer.svelte';
	import LevelMap from '#lib/earbetter/LevelMap.svelte';
	import BackButton from '#routes/BackButton.svelte';
</script>

<svelte:head>
	<title>Earbetter trainer</title>
</svelte:head>

<main>
	<BackButton onclick={() => goto(resolve('/'))} />
	<Header />
	<LevelMap />
	<div class="box"><Footer /></div>
</main>
