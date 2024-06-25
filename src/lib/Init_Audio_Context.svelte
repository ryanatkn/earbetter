<script lang="ts">
	import {get_ac} from './ac.js';

	/**
	 * This component transparently initializes the audio context to work around
	 * the browser's protection against auto-play. Chrome's message is:
	 *  "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page."
	 * If this strategy fails on any browsers,
	 * it could be changed to create the audio context instead of resuming.
	 */

	const ac = get_ac();

	let inited = $state(false);

	const init = async () => {
		if (inited) return;
		inited = true;
		console.log('initing audio context');
		await ac().resume();
	};
</script>

<svelte:window
	onclickcapture={inited ? undefined : init}
	onkeydowncapture={inited ? undefined : init}
/>
