<script lang="ts">
	import {page} from '$app/stores';
	import {goto} from '$app/navigation';
	import {base} from '$app/paths';

	import Earworm from '$lib/earworm/Earworm.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';
	import type {LevelDef} from '$lib/earworm/level';
	import {parse_from_hash} from '$lib/util/url';

	// TODO read the query
	$: active_level_def = parse_from_hash<LevelDef>($page.url.hash);
	$: if (active_level_def === null) void goto(`${base}/game`);
</script>

<main>
	<Earworm {active_level_def}>
		<svelte:fragment slot="header"><Header /></svelte:fragment>
		<svelte:fragment slot="footer"><Footer /></svelte:fragment>
	</Earworm>
</main>
