<script lang="ts">
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Earbetter from '$lib/earbetter/Earbetter.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import {LevelHashData} from '$lib/earbetter/level';
	import {parse_from_hash} from '$lib/url';
	import {get_app} from '$lib/earbetter/app';

	const go_back = () => goto(`${base}/game`);

	const app = get_app();

	// TODO add this to the app data so it's persisted when we navigate, and can be saved if it's not in the list
	$: parsed = LevelHashData.safeParse(parse_from_hash($page.url.hash));
	$: active_level_data = parsed.success ? parsed.data : null;
	$: if (active_level_data === null) {
		void go_back();
	} else {
		app.active_level_data.value = active_level_data.level;
	}
</script>

<svelte:head>
	<title>Earbetter: play game</title>
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
		font-size: var(--size_3);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		/* TODO same as var(--level_progress_height); */
		height: 50px;
	}
</style>
