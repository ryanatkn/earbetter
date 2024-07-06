<script lang="ts">
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_app} from '$lib/earbetter/app.js';
	import Level_Map from '$lib/earbetter/Level_Map.svelte';
	import Back_Button from '$routes/Back_Button.svelte';

	const app = get_app();
</script>

<svelte:head>
	<title>Earbetter trainer</title>
</svelte:head>

<main>
	<Back_Button onclick={() => goto(base + '/')} />
	<Header />
	<Level_Map {app} />
	<div class="box"><Footer /></div>
</main>
