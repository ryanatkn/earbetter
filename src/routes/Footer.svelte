<script lang="ts">
	import Svg from '@fuzdev/fuz_ui/Svg.svelte';
	import { logo_github } from '@fuzdev/fuz_ui/logos.ts';

	import SiteBreadcrumb from './SiteBreadcrumb.svelte';

	interface Props {
		hide_main_menu_button?: boolean;
	}

	const { hide_main_menu_button = false }: Props = $props();
</script>

<footer>
	<div class="mb_lg" style:--font_size="var(--font_size_xl)">
		<SiteBreadcrumb {hide_main_menu_button} />
	</div>
	<div class="box">
		<a class="box chip p_md" href="https://github.com/ryanatkn/earbetter">
			<Svg data={logo_github} size="var(--icon_size_lg)" /> source code
		</a>
	</div>
	<!-- TODO switch to `class="font_size_xl"` when Fuz changes to use vb/vi -->
</footer>

<style>
	footer {
		padding: var(--font_size_md);
		margin: var(--space_xl3) auto;
		text-align: center;
	}
</style>
