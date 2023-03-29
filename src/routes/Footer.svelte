<script lang="ts">
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';

	export let flush = false;

	$: pathname = $page.url.pathname;
	$: home = pathname === base + '/';
</script>

<footer class:flush>
	<div class="panel padded-md column-sm">
		<a href="https://github.com/ryanatkn/earbetter">source code</a>
		<div>public domain</div>
		<div class="breadcrumbs-wrapper">
			<!-- TODO this awkwardly nests a link -->
			<Breadcrumbs
				>{#if home}<a href="{base}/map">🎶🦜</a>{:else}🎶🦜{/if}</Breadcrumbs
			>
		</div>
	</div>
</footer>

<style>
	footer {
		margin: var(--spacing_xl3) auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: var(--spacing_xl3);
	}
	.flush {
		padding-bottom: 0;
	}
	.flush > .panel {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.breadcrumbs-wrapper {
		font-size: var(--font_size_xl2);
	}
</style>
