<script lang="ts">
	import {randomInt, randomItem, randomFloat} from '@feltjs/util/random.js';
	import {GR2i} from '@feltjs/util/maths.js';
	import {onMount} from 'svelte';

	export let count: number;
	export let items: string[];
	export let duration = 2000;
	export let xRadius = 250;
	export let yRadius = 250;
	export let scaleMin = GR2i;
	export let scaleMax = 1;
	export let hueRotationMin = 0;
	export let hueRotationMax = 0; // set to 360 to get a random range of colors
	export let startRotationMin = 0;
	export let startRotationMax = 360;
	export let endRotationMin = 0;
	export let endRotationMax = 360;

	let done = false;

	let timeout: number;
	onMount(() => {
		timeout = setTimeout(() => (done = true), duration);
		return () => clearTimeout(timeout);
	});
</script>

{#if !done}
	<div class="burst" style:--animation_timer="{duration}ms">
		{#each {length: count} as _}<div
				class="burst-item"
				style:--target_x="{randomInt(-xRadius, xRadius)}px"
				style:--target_y="{randomInt(-yRadius, yRadius)}px"
				style:--scale={randomFloat(scaleMin, scaleMax)}
				style:--start_rotation="{randomInt(startRotationMin, startRotationMax)}deg"
				style:--end_rotation="{randomInt(endRotationMin, endRotationMax)}deg"
				style:--hue_rotation="{randomInt(hueRotationMin, hueRotationMax)}deg"
			>
				{randomItem(items)}
			</div>{/each}
	</div>
{/if}

<style>
	.burst {
		position: relative;
	}
	.burst-item {
		position: absolute;
		left: 0;
		top: 0;
		filter: hue-rotate(var(--hue_rotation));
		transform: translate3d(0, 0, 0) scale3d(0, 0, 0);
		animation: burst var(--animation_timer) linear;
	}
	/* TODO can probably be improved to remove the `calc` values
	using the new standalone transform properties
	but I couldn't get it to work and it's late and I want to get this PR merged */
	@keyframes burst {
		0% {
			transform: translate3d(0, 0, 0) scale3d(0, 0, 0) rotate(var(--start_rotation));
		}
		7% {
			transform: translate3d(0, 0, 0) scale3d(var(--scale), var(--scale), var(--scale))
				rotate(calc(0.93 * var(--start_rotation) + 0.07 * var(--end_rotation)));
		}
		100% {
			transform: translate3d(var(--target_x), var(--target_y), 0) scale3d(0, 0, 0)
				rotate(var(--end_rotation));
		}
	}
</style>
