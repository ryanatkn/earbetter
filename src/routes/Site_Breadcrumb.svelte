<script lang="ts">
	import Breadcrumb from '@ryanatkn/fuz/Breadcrumb.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	$: pathname = $page.url.pathname;
	$: home = pathname === base + '/';
</script>

<!-- TODO this awkwardly nests a link -->
<Breadcrumb
	>{#if home}<a href="{base}/map">🎶🦜</a>{:else}🎶🦜{/if}</Breadcrumb
>
