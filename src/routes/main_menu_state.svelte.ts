import {getContext, setContext} from 'svelte';

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

const MAIN_MENU_KEY = Symbol('main_menu');

export const get_main_menu = (): Main_Menu_State => getContext(MAIN_MENU_KEY);

export const set_main_menu = (main_menu = new Main_Menu_State()): Main_Menu_State =>
	setContext(MAIN_MENU_KEY, main_menu);
