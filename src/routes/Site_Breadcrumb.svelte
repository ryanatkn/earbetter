<script lang="ts">
	import Breadcrumb from '@ryanatkn/fuz/Breadcrumb.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	import {get_main_menu} from '$routes/main_menu_state.svelte.js';

	interface Props {
		hide_main_menu_button?: boolean;
	}

	const {hide_main_menu_button = false}: Props = $props();

	// TODO @many find the other of these hacks - what's going on? I can't seem to find anything searching online about this, it's `.` on SSR for some reason
	const TODO_HACK_base = (base as any) === '.' ? '' : base;

	const pathname = $derived($page.url.pathname);
	const home = $derived(pathname === TODO_HACK_base + '/');

	const main_menu = get_main_menu();
</script>

{#if home}
	{#if !hide_main_menu_button}
		<button type="button" onclick={() => main_menu.open()}>main menu</button>
	{/if}
{:else}
	<Breadcrumb>🎶🦜</Breadcrumb>
{/if}
