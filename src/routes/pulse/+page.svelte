<script lang="ts">
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { audio_context_context } from '#lib/audio_context.ts';
	import { pulse_sound_is_pitched } from '#lib/pulse.ts';
	import { Pulse } from '#lib/pulse.svelte.ts';
	import PulsePitchControl from '#lib/PulsePitchControl.svelte';
	import PulseRateControl from '#lib/PulseRateControl.svelte';
	import PulseSoundControl from '#lib/PulseSoundControl.svelte';
	import VolumeControl from '#lib/VolumeControl.svelte';
	import Header from '#routes/Header.svelte';
	import Footer from '#routes/Footer.svelte';
	import BackButton from '#routes/BackButton.svelte';
	import { app_context } from '#lib/earbetter/app.svelte.ts';

	const app = app_context.get();

	const pulse = new Pulse(audio_context_context.get());

	// a genuine effect: the volume is the app's and changes from places this page doesn't see,
	// like the main menu and other tabs, and the playing sound is external to Svelte
	$effect(() => {
		pulse.volume = app.volume;
	});

	// the pulse belongs to this page, so it stops when navigating away
	onDestroy(pulse.stop);
</script>

<svelte:head>
	<title>Earbetter: pulse</title>
</svelte:head>

<main>
	<BackButton onclick={() => goto(resolve('/'))} />
	<Header />
	<section class="my_xl3">
		<button type="button" class="big" onclick={pulse.toggle}>
			{pulse.playing ? 'stop' : 'play'}
		</button>
	</section>
	<form class="width_atmost_sm panel p_md">
		<fieldset>
			<PulseRateControl bind:rate={pulse.rate} />
			<PulseSoundControl bind:sound={pulse.sound} />
			<PulsePitchControl bind:pitch={pulse.pitch} disabled={!pulse_sound_is_pitched(pulse.sound)} />
			<VolumeControl bind:volume={app.volume} />
		</fieldset>
	</form>
	<Footer />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
