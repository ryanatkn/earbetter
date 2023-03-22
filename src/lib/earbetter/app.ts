import {goto} from '$app/navigation';
import {base} from '$app/paths';
import {z} from 'zod';
import {effect, signal, type Signal} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';

import {level_defs} from '$lib/earbetter/level_defs';
import type {LevelDef, LevelId} from '$lib/earbetter/level';
import {ProjectDef, ProjectId} from '$lib/earbetter/project';
import {create_level_stats} from '$lib/earbetter/level_stats';
import {load_from_storage, set_in_storage} from '$lib/util/storage';

export const AppData = z.object({
	projects: z.array(ProjectId),
});
export type AppData = z.infer<typeof AppData>;

export const DEFAULT_APP_DATA: AppData = {projects: []};

const APP_KEY = Symbol('app');
export const get_app = (): App => getContext(APP_KEY);
export const set_app = (store: App): App => setContext(APP_KEY, store);

export class App {
	app_data: Signal<AppData>;

	selected_project_def: Signal<ProjectDef | null> = signal(null);
	project_defs: Signal<ProjectDef[]> = signal([]);

	level_defs: Signal<LevelDef[]> = signal(level_defs.slice());
	active_level_def: Signal<LevelDef | null> = signal(null);
	editing_level_def: Signal<LevelDef | null> = signal(null);

	level_stats = create_level_stats();

	constructor(public readonly get_ac: () => AudioContext) {
		// TODO BLOCK refactor
		// TODO BLOCK maybe `new App(App.load())` ?
		const APP_STORAGE_KEY = 'app';
		this.app_data = signal(
			load_from_storage(
				APP_STORAGE_KEY,
				() => DEFAULT_APP_DATA,
				(v) => AppData.parse(v),
			),
		);
		console.log(`app_data`, this.app_data.peek());

		effect(() => {
			// TODO BLOCK isn't working, make efficient
			console.log('SAVING APP DATA');
			set_in_storage(
				APP_STORAGE_KEY,
				(this.app_data.value = {projects: this.project_defs.peek().map((p) => p.id)}),
			);
		});
	}

	// let project: ProjectDef | null = load_from_storage();
	select_project = (id: ProjectId): void => {
		this.selected_project_def.value = this.project_defs.peek().find((d) => d.id === id) || null;
	};

	edit_project = (project_def: ProjectDef | null): void => {
		this.selected_project_def.value = project_def;
	};

	remove_project = (id: ProjectId): void => {
		if (this.selected_project_def.peek()?.id === id) {
			this.selected_project_def.value = null;
		}
		this.project_defs.value = this.project_defs.peek().filter((d) => d.id !== id);
	};

	create_project = (p: ProjectDef): void => {
		this.app_data.value = {
			...this.app_data.peek(),
			projects: this.app_data.peek().projects.concat(p.id),
		};
		set_in_storage(p.id, p);
		this.project_defs.value = this.project_defs.peek().concat(p);
		this.selected_project_def.value = p;
	};

	update_project = (project_def: ProjectDef): void => {
		const {id} = project_def;
		const index = this.project_defs.peek().findIndex((p) => p.id === id);
		if (index === -1) return;
		const next_project_defs = this.project_defs.peek().slice();
		next_project_defs[index] = project_def;
		this.project_defs.value = next_project_defs;
		if (this.selected_project_def.peek()?.id === id) {
			this.selected_project_def.value = project_def;
		}
		console.log(`update_project project_def`, project_def);
	};

	play_level_def = async (id: LevelId): Promise<void> => {
		const level_def = this.level_defs.peek().find((d) => d.id === id);
		if (!level_def) {
			console.error('cannot find level_def with id', id);
			return;
		}
		void this.get_ac().resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `play_level_def` is called without a user action
		await goto(`${base}/game/play#` + encodeURIComponent(JSON.stringify(level_def)));
	};

	edit_level_def = (level_def: LevelDef | null): void => {
		this.editing_level_def.value = level_def;
	};

	remove_level_def = (id: LevelId): void => {
		const level_def = this.level_defs.peek().find((d) => d.id === id);
		if (!level_def) {
			console.error('cannot find level_def with id', id);
			return;
		}
		if (id === this.editing_level_def.value?.id) {
			this.editing_level_def.value = null;
		}
		this.level_defs.value = this.level_defs.peek().filter((d) => d !== level_def);
	};

	create_level_def = (level_def: LevelDef): void => {
		const found = this.level_defs.peek().find((d) => d.id === level_def.id);
		if (found) return; // TODO maybe update?
		this.level_defs.value = this.level_defs.peek().concat(level_def);
		this.editing_level_def.value = level_def;
	};

	update_level_def = (level_def: LevelDef): void => {
		const {id} = level_def;
		const index = this.level_defs.peek().findIndex((d) => d.id === id);
		if (index === -1) {
			console.error('cannot find level def to update', level_def);
			return;
		} else {
			const updated = this.level_defs.peek().slice();
			updated[index] = level_def;
			this.level_defs.value = updated;
		}
		this.editing_level_def.value = level_def;
	};

	exit_level_to_map = async (success = false): Promise<void> => {
		const $active_level_def = this.active_level_def.peek();
		if (!$active_level_def) return;
		if (success) {
			this.level_stats.register_success($active_level_def.id);
		}
		this.active_level_def.value = null;
		await goto('#');
	};
}
