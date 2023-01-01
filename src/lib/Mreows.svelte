<script lang="ts">
	import {unwrap} from '@feltcoop/util';
	import {randomItem} from '@feltcoop/util/random.js';

	import Positioned from '$lib/Positioned.svelte';

	interface Mreow {
		icon: string;
	}

	const items: Mreow[] = unwrap({
		ok: true,
		value: [
			{icon: '🐵'},
			{icon: '🐶'},
			{icon: '🐺'},
			{icon: '🦊'},
			{icon: '🐱'},
			{icon: '🦁'},
			{icon: '🐯'},
			{icon: '🐴'},
			{icon: '🦄'},
			{icon: '🦓'},
			{icon: '🐮'},
			{icon: '🐭'},
			{icon: '🐹'},
			{icon: '🐰'},
			{icon: '🐻'},
			{icon: '🐼'},
			{icon: '🐸'},
			{icon: '🐲'},
		],
	});

	export let mreows = [items[4]];

	const mreow = (): void => {
		mreows = [{...randomItem(items)!}].concat(mreows);
	};

	let layout: LayoutItem[];
	$: layout = clientWidth === undefined ? [] : toLayout(mreows, clientWidth);

	interface LayoutItem {
		index: number;
		x: number;
		y: number;
		scale: number;
		row: number;
		column: number;
		mreow: Mreow;
		fontSize: number;
	}

	const COLUMN_COUNT = 5;

	// TODO tweened x/y?
	const toLayout = (mreows: Mreow[], width: number): LayoutItem[] => {
		const columnWidth = Math.floor(width / COLUMN_COUNT);
		const ROW_HEIGHT = columnWidth;
		return mreows.map((mreow, i): LayoutItem => {
			const row = Math.floor(i / COLUMN_COUNT);
			const flowsLeft = row % 2 === 1;
			const column = flowsLeft ? COLUMN_COUNT - 1 - (i % COLUMN_COUNT) : i % COLUMN_COUNT;
			return {
				index: i,
				x: column * columnWidth,
				y: row * ROW_HEIGHT,
				row,
				column,
				scale: 1,
				mreow,
				fontSize: columnWidth * 0.85,
			};
		});
	};

	let clientWidth: number;
</script>

<button on:click={mreow}> mreow </button>
<div class="mreows" bind:clientWidth>
	{#each layout as item, i (item.mreow)}<Positioned
			x={item.x}
			y={item.y}
			scale={item.scale + Math.cos(i) / 3.5}
			><span style:font-size="{item.fontSize}px">{item.mreow.icon}</span></Positioned
		>{/each}
</div>

<style>
	.mreows {
		position: relative;
		width: 100%;
	}
</style>
