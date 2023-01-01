import {writable, type Writable} from 'svelte/store';

import type {LevelDef} from '$lib/earworm/level';

export type LevelStatsState = {
	completed: {[key: string]: boolean};
};

export interface LevelStats {
	subscribe: Writable<LevelStatsState>['subscribe'];
	registerSuccess: (id: number) => void;
}

const defaultState = (defs: LevelDef[]): LevelStatsState => {
	const completed: {[key: string]: boolean} = {};
	for (const def of defs) {
		completed[def.id] = false; // TODO load from localStorage (eventually from the server)
	}
	return {
		completed,
	};
};

export const createLevelStats = (defs: LevelDef[]): LevelStats => {
	const {subscribe, update} = writable(defaultState(defs));

	return {
		subscribe,
		registerSuccess: (id: number) => {
			console.log('register success', id);
			update((s) => {
				return {
					...s,
					completed: {
						...s.completed,
						[id]: true,
					},
				};
			});
		},
	};
};
