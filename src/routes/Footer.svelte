<script lang="ts">
	import SiteBreadcrumb from '$routes/SiteBreadcrumb.svelte';

	export let flush = false;
</script>

<footer class:flush>
	<div class="panel padded_md width_sm">
		<a href="https://github.com/ryanatkn/earbetter">source code</a>
		<div>public domain</div>
		<div class="breadcrumbs-wrapper">
			<SiteBreadcrumb />
		</div>
	</div>
</footer>

<style>
	footer {
		margin: var(--space_xl3) auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: var(--space_xl3);
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
		font-size: var(--size_xl2);
	}
</style>
