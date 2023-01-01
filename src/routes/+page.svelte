<script lang="ts">
	import Message from '@feltcoop/felt/Message.svelte';

	import Mreows from '$lib/Mreows.svelte';

	let mreows: Array<{icon: string}> | undefined;
</script>

<main class="markup column">
	<section>
		<header class="centered-hz">
			<h1>felt<small><a href="https://github.com/feltcoop">💚</a></small>template</h1>
		</header>
		<Message
			><span slot="icon"
				>{#if mreows}{mreows[0].icon}{:else}✨{/if}</span
			><span
				>hello, welcome to <a href="https://github.com/feltcoop/felt-template">felt-template</a
				></span
			></Message
		>
	</section>
	<Mreows bind:mreows />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0 auto;
	}
	h1 {
		text-align: center;
	}
</style>
