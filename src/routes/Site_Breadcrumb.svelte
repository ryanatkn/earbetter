<script lang="ts">
	import Breadcrumb from '@ryanatkn/fuz/Breadcrumb.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	import {main_menu_context} from '$routes/main_menu_state.svelte.js';

	interface Props {
		hide_main_menu_button?: boolean;
	}

	const {hide_main_menu_button = false}: Props = $props();

	const pathname = $derived($page.url.pathname);
	const home = $derived(pathname === base + '/');

	const main_menu = main_menu_context.get();
</script>

{#if home}
	{#if !hide_main_menu_button}
		<button type="button" onclick={() => main_menu.open()}>main menu</button>
	{/if}
{:else}
	<Breadcrumb>🎶🦜</Breadcrumb>
{/if}
