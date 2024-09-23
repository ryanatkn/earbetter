<script lang="ts">
	import Svg from '@ryanatkn/fuz/Svg.svelte';
	import {earbetter_logo} from '@ryanatkn/fuz/logos.js';
</script>

<header>
	<div class="box panel p_md pt_xl2">
		<Svg data={earbetter_logo} size="var(--icon_size_xl3)" />
		<h1 class="my_md">earbetter</h1>
	</div>
</header>

<style>
	header {
		margin: var(--space_xl3) auto 0;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: var(--space_xl3);
	}
	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
