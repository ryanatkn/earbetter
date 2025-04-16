import {create_context} from '@ryanatkn/fuz/context_helpers.js';

// TODO @many let any routes (and components?) add sections to the menu via snippets

/**
 * Designed as a singleton to be used in the entire application. Maybe make more general?
 */
export class Main_Menu_State {
	opened = $state(false);

	open(): void {
		this.opened = true;
	}

	close(): void {
		this.opened = false;
	}

	toggle(): void {
		this.opened = !this.opened;
	}
}

export const main_menu_context = create_context(() => new Main_Menu_State());
