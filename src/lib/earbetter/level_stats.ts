import {signal, type Signal} from '@preact/signals-core';

// TODO rethink this

export type LevelStatsState = {
	completed: Record<string, boolean>;
};

export interface LevelStats {
	stats: Signal<LevelStatsState>;
	register_success: (id: string) => void;
}

export const create_level_stats = (): LevelStats => {
	const stats = signal({completed: {}});

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
