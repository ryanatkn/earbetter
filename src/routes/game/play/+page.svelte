<script lang="ts">
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Earbetter from '$lib/earbetter/Earbetter.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import type {LevelDef} from '$lib/earbetter/level';
	import {parse_from_hash} from '$lib/util/url';
	import {get_app} from '$lib/earbetter/app';

	const go_back = () => goto(`${base}/game`);

	const app = get_app();

	// TODO add this to the app data so it's persisted when we navigate, and can be saved if it's not in the list
	$: active_level_def = parse_from_hash<LevelDef>($page.url.hash);
	$: if (active_level_def === null) {
		void go_back();
	} else {
		app.active_level_def.value = active_level_def;
	}
</script>

<svelte:head>
	<title>earbetter: play game</title>
</svelte:head>

<main>
	<button class="go-back icon-button plain-button" on:click={go_back}>←</button>
	<Earbetter {app}>
		<svelte:fragment slot="header"><Header /></svelte:fragment>
		<svelte:fragment slot="footer"><Footer /></svelte:fragment>
	</Earbetter>
</main>

<style>
	.go-back {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		font-size: var(--font_size_xl3);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
</style>
