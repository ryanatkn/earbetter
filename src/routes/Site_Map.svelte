<script lang="ts">
	import {base} from '$app/paths';
	import {page} from '$app/state';
	import {strip_start} from '@ryanatkn/belt/string.js';

	import {pages} from '$routes/page_data.js';

	const selected_slug = $derived(strip_start(page.url.pathname, base));
</script>

<!-- TODO styling is messed  -->
<h2 class="section_title">site map</h2>
<nav>
	<ul class="unstyled">
		{#each pages as p (p.slug)}
			<li>
				<a class="panel" href="{base}{p.slug}" class:selected={p.slug === selected_slug}>{p.slug}</a
				>
			</li>
		{/each}
	</ul>
</nav>

<style>
	ul {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	ul li:not(:last-child) {
		margin-bottom: var(--space_md);
	}
	ul a {
		display: block;
		font-size: var(--font_size_xl);
		padding: var(--space_xl);
	}
</style>
