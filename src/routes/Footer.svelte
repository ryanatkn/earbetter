<script lang="ts">
	import Github_Logo from '@ryanatkn/fuz/Github_Logo.svelte';

	import Site_Breadcrumb from '$routes/Site_Breadcrumb.svelte';

	interface Props {
		hide_main_menu_button?: boolean;
	}

	const {hide_main_menu_button = false}: Props = $props();
</script>

<footer>
	<div class="mb_lg" style:--size="var(--size_xl)">
		<Site_Breadcrumb {hide_main_menu_button} />
	</div>
	<div class="box">
		<a class="box chip p_md" href="https://github.com/ryanatkn/earbetter">
			<Github_Logo />
			source code
		</a>
	</div>
	<!-- TODO switch to `class="size_xl"` when Fuz changes to use vb/vi -->
</footer>

<style>
	footer {
		padding: var(--size_md);
		margin: var(--space_xl3) auto;
		text-align: center;
	}
</style>
