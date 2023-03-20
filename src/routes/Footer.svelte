<script lang="ts">
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';
	import {page} from '$app/stores';
	import {base} from '$app/paths';
	import {swallow} from '@feltjs/util/dom.js';

	import {goto_random_page} from '$routes/nav';

	$: pathname = $page.url.pathname;
	$: home = pathname === base + '/';
</script>

<footer>
	<div class="panel padded-md column-sm">
		<a href="https://github.com/ryanatkn/earbetter">source code</a>
		<div>public domain</div>
		<div class="breadcrumbs-wrapper">
			<Breadcrumbs
				>{#if home}<button
						class="plain-button"
						on:click={(e) => {
							swallow(e);
							void goto_random_page();
						}}>🪱🎶</button
					>{:else}🪱🎶{/if}</Breadcrumbs
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
	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.breadcrumbs-wrapper {
		font-size: var(--font_size_xl2);
	}
</style>
