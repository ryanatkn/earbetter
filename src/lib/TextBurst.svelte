<script lang="ts">
	import {randomInt, randomItem, randomFloat} from '@feltjs/util/random.js';
	import {GR2} from '@feltjs/util/maths.js';
	import {onMount} from 'svelte';

	export let count: number;
	export let items: string[];
	export let duration = 2000;
	export let x_radius = 250;
	export let y_radius = 250;
	export let scale_min = 1;
	export let scale_max = GR2;
	export let hue_rotation_min = 0;
	export let hue_rotation_max = 0; // set to 360 to get a random range of colors
	export let start_rotation_min = 0;
	export let start_rotation_max = 360;
	export let end_rotation_min = 0;
	export let end_rotation_max = 360;

	// TODO BLOCK add `xOffset` and `yOffset` (or w/o `Offset`) to position it, maybe a min and max?

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
				style:--target_x="{randomInt(-x_radius, x_radius)}px"
				style:--target_y="{randomInt(-y_radius, y_radius)}px"
				style:--scale={randomFloat(scale_min, scale_max)}
				style:--start_rotation="{randomInt(start_rotation_min, start_rotation_max)}deg"
				style:--end_rotation="{randomInt(end_rotation_min, end_rotation_max)}deg"
				style:--hue_rotation="{randomInt(hue_rotation_min, hue_rotation_max)}deg"
			>
				{randomItem(items)}
			</div>{/each}
	</div>
{/if}

<style>
	.burst {
		position: relative;
		pointer-events: none;
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
