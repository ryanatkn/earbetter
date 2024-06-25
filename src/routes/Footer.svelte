<script lang="ts">
	import Site_Breadcrumb from '$routes/Site_Breadcrumb.svelte';
</script>

<footer>
	<a href="https://github.com/ryanatkn/earbetter">source code</a>
	<div>public domain</div>
	<!-- TODO switch to `class="size_xl"` when Fuz changes to use vb/vi -->
	<div style:--size="var(--size_xl)">
		<Site_Breadcrumb />
	</div>
</footer>

<style>
	footer {
		padding: var(--size_md);
		margin: var(--space_xl3) auto;
		text-align: center;
	}
</style>
