<script lang="ts">
	import {base} from '$app/paths';

	import {pages} from '$routes/nav';
</script>

<header class="title panel padded-lg"><slot><h2>website map</h2></slot></header>
<nav>
	<menu>
		{#each pages as page (page.slug)}
			<li><a class="panel" href="{base}{page.slug}">{page.slug}</a></li>
		{/each}
	</menu>
</nav>

<style>
	menu {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	menu li:not(:last-child),
	.title {
		margin-bottom: var(--spacing_md);
	}
	menu a {
		font-size: var(--font_size_xl);
		padding: var(--spacing_xl);
	}
</style>
