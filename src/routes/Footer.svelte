<script lang="ts">
	import Site_Breadcrumb from '$routes/Site_Breadcrumb.svelte';

	interface Props {
		flush?: boolean;
	}

	const {flush = false}: Props = $props();
</script>

<footer class:flush>
	<div class="panel p_md width_sm">
		<a href="https://github.com/ryanatkn/earbetter">source code</a>
		<div>public domain</div>
		<div class="size_xl2">
			<Site_Breadcrumb />
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
</style>
