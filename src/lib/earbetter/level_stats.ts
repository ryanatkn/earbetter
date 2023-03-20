import {signal, type Signal} from '@preact/signals-core';

import type {LevelDef} from '$lib/earbetter/level';

// TODO rethink this

export type LevelStatsState = {
	completed: Record<string, boolean>;
};

export interface LevelStats {
	stats: Signal<LevelStatsState>;
	register_success: (id: string) => void;
}

const to_default_state = (defs: LevelDef[]): LevelStatsState => {
	const completed: Record<string, boolean> = {};
	for (const def of defs) {
		completed[def.id] = false; // TODO load from localStorage (eventually from the server)
	}
	console.log(`completed`, completed);
	return {
		completed,
	};
};

export const create_level_stats = (defs: LevelDef[]): LevelStats => {
	const stats = signal(to_default_state(defs));

	return {
		stats,
		register_success: (id: string) => {
			console.log('register success', id);
			stats.value = {
				...stats.peek(),
				completed: {
					...stats.peek().completed,
					[id]: true,
				},
			};
		},
	};
};
