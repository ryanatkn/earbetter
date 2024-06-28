<script lang="ts">
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {get_app} from '$lib/earbetter/app.js';
	import {midi_access} from '$lib/midi_access.js';
	import Level_Map from '$lib/earbetter/Level_Map.svelte';

	const app = get_app();
</script>

<svelte:head>
	<title>Earbetter trainer</title>
</svelte:head>

<main>
	<Header />
	<Level_Map {app} {midi_access} />
	<div class="box"><Footer /></div>
</main>
