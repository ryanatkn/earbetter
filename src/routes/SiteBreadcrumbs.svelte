<script lang="ts">
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	$: pathname = $page.url.pathname;
	$: home = pathname === base + '/';
</script>

<!-- TODO this awkwardly nests a link -->
<Breadcrumbs
	>{#if home}<a href="{base}/map">🎶🦜</a>{:else}🎶🦜{/if}</Breadcrumbs
>
