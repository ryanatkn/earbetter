<script lang="ts">
	import {base} from '$app/paths';
	import {page} from '$app/stores';
	import {strip_start} from '@ryanatkn/belt/string.js';

	import {pages} from '$routes/nav';

	$: selected_slug = strip_start($page.url.pathname, base);
</script>

<header class="section_title"><h2>site map</h2></header>
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
		margin-bottom: var(--space_md);
	}
	menu a {
		font-size: var(--size_xl);
		padding: var(--space_xl);
	}
</style>
