<script lang="ts">
	import {onMount} from 'svelte';

	// TODO what should the name/scope of this component be?

	export let x: number;
	export let y: number;
	export let scale: number;

	let scaleReady = false;
	$: finalScale = scaleReady ? scale : 0;

	// TODO what's a better way to do this? problem is using Svelte's `in:scale`
	// makes things go haywire in some cases because we're also setting `transform`
	onMount(() => {
		setTimeout(() => (scaleReady = true)); // doing one `await tick()` doesn't work but timeout does
	});
</script>

<div
	class="item"
	style:transform="translate3d({x}px, {y}px, 0px) scale3d({finalScale}, {finalScale}, {finalScale})"
>
	<slot />
</div>

<style>
	.item {
		position: absolute;
		left: 0;
		top: 0;
		transition: transform 1s ease-out;
	}
</style>
