<script lang="ts">
	import Breadcrumb from '@ryanatkn/fuz/Breadcrumb.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	const pathname = $derived($page.url.pathname);
	const home = $derived(pathname === base + '/');

	// TODO BLOCK on home, instead show a button that opens the main menu, `show_main_menu` in layout needs to be in context or something
</script>

{#if !home}<Breadcrumb>🎶🦜</Breadcrumb>{/if}
