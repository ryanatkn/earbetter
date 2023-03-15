<script lang="ts">
	import {interval_short_names} from '$lib/music/constants';
	import type {LevelStore} from '$lib/earworm/level';

	// TODO this isn't being used any more

	export let level: LevelStore;
	export let select: (index: number) => void;

	// TODO high level input control abstraction - register through context?
	const indexByKey = {
		'1': 0,
		'2': 1,
		'3': 2,
		'4': 3,
		'5': 4,
		'6': 5,
		'7': 6,
		'8': 7,
		'9': 8,
		'0': 9,
		'-': 10,
		'=': 11,
	};
	const onDocumentKeyDown = (e: KeyboardEvent) => {
		if (e.key in indexByKey) {
			const index = (indexByKey as any)[e.key];
			if (level.isInputDisabled($level, index)) return;
			select(index);
		}
	};
</script>

<div class="chromatic-input">
	{#each {length: 12} as _, index}
		<button on:click={() => select(index)} disabled={level.isInputDisabled($level, index)}>
			<div>{index}</div>
			<div>{interval_short_names[index]}</div>
		</button>
	{/each}
</div>

<svelte:window on:keydown={onDocumentKeyDown} />

<style>
	.chromatic-input {
		display: flex;
		flex-direction: column;
		position: absolute;
		top: 0;
		left: 0;
		width: 50%;
		height: 100%;
	}
	button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-size: var(--font_size_xl);
		padding: var(--spacing_xl);
		background: transparent;
	}
	/* TOOD disabled styling should be global for this kind of button (as should the other styles) */
	button[disabled] {
		color: #777;
		border-color: #777;
	}
</style>
