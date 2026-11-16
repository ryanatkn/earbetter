<script lang="ts">
	import '@ryanatkn/moss/style.css';
	import '@ryanatkn/moss/theme.css';
	import '$lib/style.css';

	import {resolve} from '$app/paths';
	import {slide} from 'svelte/transition';
	import {afterNavigate} from '$app/navigation';
	import Svg from '@ryanatkn/fuz/Svg.svelte';
	import {earbetter_logo} from '@ryanatkn/fuz/logos.js';

	import SiteMap from '$routes/SiteMap.svelte';
	import VolumeControl from '$lib/VolumeControl.svelte';
	import InstrumentControl from '$lib/InstrumentControl.svelte';
	import InitMidiButton from '$lib/InitMidiButton.svelte';
	import Footer from '$routes/Footer.svelte';
	import SiteBreadcrumb from '$routes/SiteBreadcrumb.svelte';
	import {main_menu_context} from '$routes/main_menu_state.svelte.js';
	import {app_context} from '$lib/earbetter/app.svelte.js';

	// TODO @many let any routes (and components?) add sections to the menu via snippets

	/**
	 * Designed as a singleton to be used in the entire application. Maybe make more general?
	 */

	const app = app_context.get();

	const main_menu = main_menu_context.get();
	afterNavigate(() => main_menu.opened && main_menu.close());

	let deleting = $state(false);
</script>

<div class="pane shadow_d_xl width_sm">
	<section>
		<!-- TODO when `.flex_direction_column` or equivalent is added to Moss, change `.box` to that -->
		<div class="section_title box">
			<Svg data={earbetter_logo} size="var(--icon_size_xl2)" />
			<h1 class="mb_md">earbetter</h1>
			<!-- TODO switch to `class="font_size_xl"` when Fuz changes to use vb/vi -->
			<div style:--font_size="var(--font_size_xl)"><SiteBreadcrumb hide_main_menu_button /></div>
		</div>
		<div class="section_body">
			<p>
				Earbetter is an <a href="https://wikipedia.org/wiki/Ear_training">ear trainer</a>. The
				website also has some other music tools like
				<a href={resolve('/piano')}>a virtual piano</a>. More planned, stay tuned.
			</p>
			<p>
				It's made with Svelte and TypeScript. <a href="https://github.com/ryanatkn/earbetter"
					>The code</a
				> is open source and permissively licensed.
			</p>
			<p>Press <code>Escape</code> to toggle this menu.</p>
		</div>
	</section>
	<section>
		<h2 class="section_title">settings</h2>
		<form class="section_body">
			<div class="mb_lg">
				<VolumeControl bind:volume={app.volume} />
			</div>
			<InstrumentControl bind:instrument={app.instrument} />
			<aside>Earbetter supports MIDI devices like piano keyboards, connect and click:</aside>
			<InitMidiButton midi_state={app} />
		</form>
	</section>
	<section>
		<SiteMap />
	</section>
	<section>
		<h2 class="section_title">data</h2>
		<div class="section_body">
			<p>
				Data is saved locally on your computer using <a
					href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
					><code>localStorage</code></a
				>.
			</p>
			<!-- TODO add an `export saved data` button -->
			<button type="button" class="w_100" onclick={() => (deleting = !deleting)}>
				clear saved data
			</button>
			{#if deleting}
				<div transition:slide>
					<!-- TODO `color_c_5` shouldn't be needed, something in `style.css` -->
					<button
						type="button"
						class="w_100 color_c color_c_5"
						onclick={() => {
							localStorage.clear();
							location.reload();
						}}
					>
						<div class="font_size_xl3">✕</div>
						<div class="ml_lg text_align_left">
							permanently delete<br />all locally saved data
						</div>
					</button>
				</div>
			{/if}
		</div>
	</section>
	<section>
		<h2 class="section_title">privacy</h2>
		<p class="section_body">
			This website collects no data - it sends requests to only <a href="https://pages.github.com/"
				>GitHub Pages</a
			>
			for static files. See
			<a href="https://github.com/ryanatkn/earbetter">the source code</a> for more.
		</p>
	</section>
	<div class="section_title mb_0">
		<Footer hide_main_menu_button />
	</div>
</div>
