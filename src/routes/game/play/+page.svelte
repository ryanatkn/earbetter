<script lang="ts">
	import {page} from '$app/stores';

	import Earworm from '$lib/earworm/Earworm.svelte';
	import Header from '$routes/Header.svelte';
	import Footer from '$routes/Footer.svelte';

	$: console.log(`$page`, $page);

	// TODO read the query
</script>

<main>
	<Earworm>
		<svelte:fragment slot="header"><Header /></svelte:fragment>
		<svelte:fragment slot="footer"><Footer /></svelte:fragment>
	</Earworm>
</main>
