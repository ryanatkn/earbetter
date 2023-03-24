import {signal, type Signal} from '@preact/signals-core';
import {z} from 'zod';

import {LevelId} from '$lib/earbetter/level';

export const MistakesLevelStats = z.record(LevelId, z.array(z.number()));
export type MistakesLevelStats = z.infer<typeof MistakesLevelStats>;

// TODO BLOCK use to parse from storage
export const LevelStatsState = z.object({
	mistakes: MistakesLevelStats,
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
			const s = {...stats.peek()};
			s.mistakes = {...s.mistakes}; // preserves key order
			s.mistakes[id] = add_mistakes(s.mistakes[id], mistakes);
			stats.value = s;
			console.log('register success', id, mistakes, s);
		},
	};
};

// TODO refactor - parameter? needs care tho, see comment below
export const MISTAKE_HISTORY_LENGTH = 5;

// TODO BLOCK rename, schema? we want a schema because we'll load it from storage, do that first
const add_mistakes = (data: number[] | undefined, mistakes: number): number[] => {
	const updated = data?.concat() || [];
	// TODO this won't handle a dynamic MISTAKE_HISTORY_LENGTH, wouldn't reduce the size of the array
	if (updated.length >= MISTAKE_HISTORY_LENGTH) {
		const max_value = updated.reduce((max, v) => Math.max(max, v));
		if (mistakes < max_value) {
			const index_to_remove = updated.findIndex((m) => m === max_value);
			updated[index_to_remove] = mistakes;
		}
	} else {
		updated.push(mistakes);
	}
	return updated;
};
