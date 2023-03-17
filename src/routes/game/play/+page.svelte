<script lang="ts">
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Earworm from '$lib/earworm/Earworm.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import type {LevelDef} from '$lib/earworm/level';
	import {parse_from_hash} from '$lib/util/url';

	const go_back = () => goto(`${base}/game`);

	// TODO read the query
	$: active_level_def = parse_from_hash<LevelDef>($page.url.hash);
	$: if (active_level_def === null) void go_back();
</script>

<main>
	<button class="go-back icon-button plain-button" on:click={go_back}>←</button>
	<Earworm {active_level_def}>
		<svelte:fragment slot="header"><Header /></svelte:fragment>
		<svelte:fragment slot="footer"><Footer /></svelte:fragment>
	</Earworm>
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
