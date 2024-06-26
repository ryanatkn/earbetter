<script lang="ts">
	import Breadcrumb from '@ryanatkn/fuz/Breadcrumb.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	import {get_main_menu} from '$routes/main_menu.svelte.js';

	interface Props {
		hide_main_menu_button?: boolean;
	}

	const {hide_main_menu_button = false}: Props = $props();

	const pathname = $derived($page.url.pathname);
	const home = $derived(pathname === base + '/');

	const main_menu = get_main_menu();
</script>

{#if home}
	{#if !hide_main_menu_button}
		<button onclick={() => main_menu.open()}>main menu</button>
	{/if}
{:else}
	<Breadcrumb>🎶🦜</Breadcrumb>
{/if}
