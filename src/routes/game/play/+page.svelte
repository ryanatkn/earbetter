<script lang="ts">
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Earbetter from '$lib/earbetter/Earbetter.svelte';
	import {Level_Hash_Data} from '$lib/earbetter/level.js';
	import {parse_from_hash} from '$lib/url.js';
	import {get_app} from '$lib/earbetter/app.js';

	const go_back = () => goto(`${base}/game`);

	const app = get_app();

	// TODO add this to the app data so it's persisted when we navigate, and can be saved if it's not in the list
	const parsed = $derived(Level_Hash_Data.safeParse(parse_from_hash($page.url.hash)));
	const active_level_data = $derived(parsed.success ? parsed.data : null);
	// TODO BLOCK @multiple misusing effect setting state - this one seems ok? even if it writes to the url hash
	$effect(() => {
		console.log('$effect setting `active_level_data` from URL hash');
		if (active_level_data === null) {
			void go_back();
		} else {
			app.active_level_data.value = active_level_data.level;
		}
	});
</script>

<svelte:head>
	<title>Earbetter: play game</title>
</svelte:head>

<main>
	<button title="go back" class="go_back icon_button plain_button" onclick={go_back}>←</button>
	<Earbetter {app} />
</main>

<style>
	.go_back {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		font-size: var(--size_xl3);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		/* TODO same as var(--level_progress_height); */
		height: 50px;
		width: 50px;
		line-height: 1;
	}
</style>
