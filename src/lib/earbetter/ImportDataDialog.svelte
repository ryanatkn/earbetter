<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import Dialog from '@fuzdev/fuz_ui/Dialog.svelte';
	import Alert from '@fuzdev/fuz_ui/Alert.svelte';
	import CopyToClipboard from '@fuzdev/fuz_ui/CopyToClipboard.svelte';

	/**
	 * Imports and exports an entity as JSON in a dialog, and shows why an import failed.
	 * The trigger is the `children` snippet, so it keeps the form's own button styles.
	 */
	const {
		noun,
		data,
		to_data,
		parse,
		create_id,
		onimport,
		children
	}: {
		/**
		 * Names the entity in the dialog, like `'project'`.
		 */
		noun: string;
		/**
		 * The data being edited. A change clears the import error.
		 */
		data: T;
		/**
		 * Returns the data to export, which may include unsaved edits.
		 */
		to_data: () => T;
		/**
		 * Parses imported JSON, throwing an `Error` whose message is shown when it's invalid.
		 */
		parse: (json: unknown) => T;
		/**
		 * Gives imported data without an `id` a new one.
		 */
		create_id: () => string;
		onimport: (data: T) => void;
		children: Snippet<[open: () => void]>;
	} = $props();

	let importing = $state(false);
	let serialized = $state('');
	let updated = $state('');
	const changed = $derived(serialized !== updated);

	let error_message = $derived.by(() => {
		data;
		return '';
	});

	let textarea_el: HTMLTextAreaElement | undefined = $state();
	let opener_el: Element | null = null;

	const open = (): void => {
		opener_el = document.activeElement;
		serialized = updated = JSON.stringify(to_data());
		importing = true;
	};

	const close = (): void => {
		importing = false;
		if (opener_el instanceof HTMLElement) opener_el.focus();
		opener_el = null;
	};

	const import_data = (): void => {
		error_message = '';
		try {
			const json = JSON.parse(updated);
			if (json && !json.id) json.id = create_id();
			onimport(parse(json));
		} catch (err) {
			error_message = err.message || 'unknown error';
		}
		close();
	};
</script>

{@render children(open)}
{#if error_message}
	<div class="overflow-x:auto">
		<Alert status="error"><pre>{error_message}</pre></Alert>
	</div>
{/if}
{#if importing}
	<Dialog onclose={close}>
		<div class="importing pane shadow_xl shadow_d_50 p_xl width_atmost_md mx_auto">
			<h2 class="my_0">import {noun} data</h2>
			<CopyToClipboard class="my_lg" text={updated} oncopy={() => textarea_el?.select()} />
			<textarea bind:value={updated} bind:this={textarea_el}></textarea>
			<button
				type="button"
				onclick={import_data}
				disabled={!changed}
				title={changed ? undefined : 'data has not changed'}
			>
				import {noun} data
			</button>
		</div>
	</Dialog>
{/if}

<style>
	.importing textarea {
		height: calc(var(--input_height) * 3);
	}
</style>
