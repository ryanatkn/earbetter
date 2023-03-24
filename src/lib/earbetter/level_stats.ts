import {signal, type Signal} from '@preact/signals-core';
import {z} from 'zod';

import {LevelId} from '$lib/earbetter/level';

export const CompletedLevelStats = z.record(LevelId, z.array(z.number()));
export type CompletedLevelStats = z.infer<typeof CompletedLevelStats>;

// TODO BLOCK use to parse from storage
export const LevelStatsState = z.object({
	mistakes: CompletedLevelStats,
});
export type LevelStatsState = z.infer<typeof LevelStatsState>;

export interface LevelStats {
	stats: Signal<LevelStatsState>;
	register_success: (id: LevelId, mistakes: number) => void;
}

export const create_level_stats = (): LevelStats => {
	const stats = signal<LevelStatsState>({mistakes: {}});

	return {
		stats,
		register_success: (id, mistakes) => {
			const s = stats.peek();
			stats.value = {
				...s,
				mistakes: {
					...s.mistakes,
					[id]: to_success_data(s.mistakes[id], mistakes),
				},
			};
			console.log('register success', id, mistakes, stats.peek());
		},
	};
};

// TODO refactor - parameter? needs care tho, see comment below
export const MISTAKE_HISTORY_LENGTH = 5;

// TODO BLOCK rename, schema?
const to_success_data = (data: number[] | undefined, mistakes: number): number[] => {
	const updated = data?.concat() || [];
	// TODO this won't handle a dynamic MISTAKE_HISTORY_LENGTH, wouldn't reduce the size of the array
	if (updated.length >= MISTAKE_HISTORY_LENGTH) {
		const max_value = updated.reduce((min, v) => Math.min(min, v));
		if (mistakes < max_value) {
			const index_to_remove = updated.findIndex((m) => m === max_value);
			updated[index_to_remove] = mistakes;
		}
	} else {
		updated.push(mistakes);
	}
	return updated;
};
