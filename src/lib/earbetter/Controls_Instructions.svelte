<script lang="ts">
	import {main_menu_context} from '$routes/main_menu_state.svelte.js';

	const main_menu = main_menu_context.get();
</script>

<aside>
	devices with smaller screens aren't well supported yet, see <a
		href="https://github.com/ryanatkn/earbetter/issues/2">issue #2</a
	>
</aside>
<table>
	<tbody>
		<tr>
			<td><code>Spacebar</code></td>
			<td>replay trial</td>
		</tr>
		<tr>
			<td><code>r</code></td>
			<td>restart level</td>
		</tr>
		<tr>
			<td><code>Escape</code></td>
			<td
				><button
					type="button"
					class="inline"
					style:min-width="172px"
					onclick={() => main_menu.toggle()}>toggle main menu</button
				></td
			>
		</tr>
		<tr>
			<td><code>1 to 4</code></td>
			<td>set instrument</td>
		</tr>
		<tr>
			<td><code>c</code></td>
			<!-- TODO make this a button like the above, need to refactor `Init_Midi_Button` into a reusable class instance -->
			<td>connect MIDI</td>
		</tr>
		<tr>
			<td><code>up/down arrows</code></td>
			<td>adjust volume</td>
		</tr>
	</tbody>
</table>

<style>
	td {
		padding: var(--space_xs3) 0;
	}
</style>
