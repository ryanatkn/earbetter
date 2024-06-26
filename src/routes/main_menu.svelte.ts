import {getContext, setContext} from 'svelte';

export class Main_Menu {
	opened = $state(false);

	open(): void {
		this.opened = true;
	}

	close(): void {
		console.log('CLOSE');
		this.opened = false;
	}

	toggle(): void {
		this.opened = !this.opened;
	}
}

const MAIN_MENU_KEY = Symbol('main_menu');

export const get_main_menu = (): Main_Menu => getContext(MAIN_MENU_KEY);

export const set_main_menu = (main_menu = new Main_Menu()): Main_Menu =>
	setContext(MAIN_MENU_KEY, main_menu);
