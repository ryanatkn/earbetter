<script lang="ts">
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';
</script>

<footer>
	<div class="panel padded-md column-sm">
		<div>public domain</div>
		<a href="https://github.com/ryanatkn/earworm">source code on GitHub</a>
		<Breadcrumbs basePath="" />
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
</style>
