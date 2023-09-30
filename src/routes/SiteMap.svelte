<script lang="ts">
	import {base} from '$app/paths';
	import {page} from '$app/stores';
	import {stripStart} from '@grogarden/util/string.js';

	import {pages} from '$routes/nav';

	$: selected_slug = stripStart($page.url.pathname, base);
</script>

<header class="section-title"><h2>site map</h2></header>
<nav>
	<menu>
		{#each pages as p (p.slug)}
			<li>
				<a class="panel" href="{base}{p.slug}" class:selected={p.slug === selected_slug}>{p.slug}</a
				>
			</li>
		{/each}
	</menu>
</nav>

<style>
	menu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	menu li:not(:last-child) {
		margin-bottom: var(--spacing_md);
	}
	menu a {
		font-size: var(--font_size_xl);
		padding: var(--spacing_xl);
	}
</style>
