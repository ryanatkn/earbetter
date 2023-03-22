import {goto} from '$app/navigation';
import {base} from '$app/paths';
import {z} from 'zod';
import {signal, type Signal} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';

import type {LevelDef, LevelId} from '$lib/earbetter/level';
import {create_project_def, ProjectDef, ProjectId} from '$lib/earbetter/project';
import {create_level_stats} from '$lib/earbetter/level_stats';
import {load_from_storage, set_in_storage} from '$lib/util/storage';

// TODO refactor all storage calls, and rethink in signals instead of all top-level orchestration (that's less reusable)

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

	level_defs: Signal<LevelDef[]> = signal([]); // TODO BLOCK duplicates info on `selected_project_def`
	active_level_def: Signal<LevelDef | null> = signal(null);
	editing_level_def: Signal<LevelDef | null> = signal(null);

	level_stats = create_level_stats();

	constructor(public readonly get_ac: () => AudioContext, public readonly storage_key = 'app') {
		// TODO BLOCK refactor
		// TODO BLOCK maybe `new App(App.load())` ?
		this.app_data = signal(
			load_from_storage(
				storage_key,
				() => DEFAULT_APP_DATA,
				(v) => AppData.parse(v),
			),
		);
		console.log(`app_data`, this.app_data.peek());
		this.load_project(this.app_data.peek().projects[0] || null);

		// TODO BLOCK delete id from app_data if not loadable -- load_project?
	}

	toJSON(): AppData {
		console.log('App.toJSON');
		return {projects: this.project_defs.peek().map((p) => p.id)};
	}

	// TODO BLOCK use this
	save(): void {
		console.log('App.save');
		set_in_storage(this.storage_key, (this.app_data.value = this.toJSON()));
	}

	// TODO BLOCK reactive?
	save_project = (id: ProjectId): void => {
		const project_def = this.project_defs.peek().find((p) => p.id === id);
		set_in_storage(id, project_def); // correctly deletes the storage key if `undefined`
	};

	load_project = (id: ProjectId | null): void => {
		const loaded = id
			? load_from_storage(
					id,
					() => null,
					(v) => ProjectDef.parse(v),
			  )
			: null;
		console.log(`loaded`, loaded);
		if (loaded) {
			// TODO batch if this code stays imperative like this
			this.project_defs.value = this.project_defs.peek().concat(loaded);
			this.selected_project_def.value = loaded;
			this.level_defs.value = loaded.level_defs; // TODO BLOCK hacky
		} else {
			console.log(`load_project failed id, saving`, id);
			this.create_project(create_project_def());
			this.save(); // TODO BLOCK where to do this?
		}
	};

	select_project = (id: ProjectId | null): void => {
		this.selected_project_def.value = id
			? this.project_defs.peek().find((d) => d.id === id) || null
			: null;
	};

	edit_project = (project_def: ProjectDef | null): void => {
		this.selected_project_def.value = project_def;
	};

	remove_project = (id: ProjectId): void => {
		const existing = this.project_defs.peek().find((d) => d.id === id);
		if (!existing) return;
		if (this.selected_project_def.peek()?.id === id) {
			this.selected_project_def.value = null;
		}
		this.project_defs.value = this.project_defs.peek().filter((d) => d !== existing);
		this.save_project(id);
	};

	create_project = (project_def: ProjectDef): void => {
		const {id} = project_def;
		const existing = this.project_defs.peek().find((d) => d.id !== id);
		if (existing) {
			return this.update_project(project_def);
		}
		this.app_data.value = {
			...this.app_data.peek(),
			projects: this.app_data.peek().projects.concat(id),
		};
		this.project_defs.value = this.project_defs.peek().concat(project_def);
		this.selected_project_def.value = project_def;
		this.save_project(id);
	};

	update_project = (project_def: ProjectDef): void => {
		const {id} = project_def;
		const index = this.project_defs.peek().findIndex((p) => p.id === id);
		if (index === -1) {
			return this.create_project(project_def);
		}
		const updated = this.project_defs.peek().slice();
		updated[index] = project_def;
		this.project_defs.value = updated;
		if (this.selected_project_def.peek()?.id === id) {
			this.selected_project_def.value = project_def;
		}
		this.save_project(id);
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
		if (found) {
			return this.update_level_def(level_def);
		}
		this.level_defs.value = this.level_defs.peek().concat(level_def);
		this.editing_level_def.value = level_def;
	};

	update_level_def = (level_def: LevelDef): void => {
		const {id} = level_def;
		const index = this.level_defs.peek().findIndex((d) => d.id === id);
		if (index === -1) {
			return this.create_level_def(level_def);
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
