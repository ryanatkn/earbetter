import {goto} from '$app/navigation';
import {z} from 'zod';
import {signal, type Signal, computed, effect} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';
import {Logger} from '@feltjs/util/log.js';

import {
	add_mistakes_to_level_stats,
	to_play_level_url,
	type Level,
	type LevelDef,
	type LevelId,
} from '$lib/earbetter/level';
import {create_project_def, ProjectDef, ProjectId, ProjectName} from '$lib/earbetter/project';
import {load_from_storage, set_in_storage} from '$lib/util/storage';
import type {RealmDef, RealmId} from '$lib/earbetter/realm';

const log = new Logger('[app]');

// TODO refactor all storage calls, and rethink in signals instead of all top-level orchestration (that's less reusable)

export const AppData = z.object({
	projects: z.array(z.object({id: ProjectId, name: ProjectName})),
});
export type AppData = z.infer<typeof AppData>;

export const DEFAULT_APP_DATA: AppData = {projects: []};

const APP_KEY = Symbol('app');
export const get_app = (): App => getContext(APP_KEY);
export const set_app = (store: App): App => setContext(APP_KEY, store);

export class App {
	// TODO wheres the source of truth?
	// currently manually syncing the same changes to both `app_data` `project_defs` --
	// mixing serialization concerns with runtime representations
	app_data: Signal<AppData>;

	project_defs: Signal<ProjectDef[]> = signal([]);

	selected_project_def: Signal<ProjectDef | null> = signal(null);
	level_defs = computed(() => this.selected_project_def.value?.level_defs || null);
	realm_defs = computed(() => this.selected_project_def.value?.realm_defs || null);
	editing_project: Signal<boolean> = signal(false);
	editing_project_def: Signal<ProjectDef | null> = signal(null); // this may be `selected_project_def`, or a new project def that hasn't been created yet

	level: Signal<Level | null> = signal(null);

	active_level_def: Signal<LevelDef | null> = signal(null);
	editing_level_def: Signal<LevelDef | null> = signal(null);

	// TODO BLOCK make these ids? same elsewhere to avoid needing to mutate?
	selected_realm_def: Signal<RealmDef | null> = signal(null);
	editing_realm: Signal<boolean> = signal(false);
	editing_realm_def: Signal<RealmDef | null> = signal(null);

	constructor(public readonly get_ac: () => AudioContext, public readonly storage_key = 'app') {
		// TODO maybe `new App(App.load())` ?
		this.app_data = signal(this.load());
		this.saved = this.app_data.peek(); // hacky, but enables the following effect without waste
		effect(() => this.save()); // TODO do effects like this need to be cleaned up or is calling dispose only for special cases?
		log.trace(`app_data`, this.app_data.peek());
		this.load_project(this.app_data.peek().projects[0]?.id || null);
		// TODO refactor
		const project_def = this.project_defs.peek()[0];
		if (project_def) {
			this.selected_project_def.value = project_def;
			const realm_def = project_def.realm_defs[0];
			if (realm_def) {
				this.selected_realm_def.value = realm_def;
			}
		}
	}

	// returns a stable reference to data that's immutable by convention
	toJSON(): AppData {
		return this.app_data.value;
	}

	load(): AppData {
		const loaded = load_from_storage(this.storage_key, DEFAULT_APP_DATA, AppData.parse);
		let ids_to_delete: ProjectId[] | null = null;
		for (const p of loaded.projects) {
			if (localStorage.getItem(p.id) === null) {
				console.warn('deleting unknown id', p);
				(ids_to_delete || (ids_to_delete = [])).push(p.id);
			}
		}
		if (ids_to_delete) {
			loaded.projects = loaded.projects.filter((p) => !ids_to_delete!.includes(p.id));
		}
		return loaded;
	}

	private saved: AppData; // immutable, used to avoid waste

	save(): void {
		const data = this.toJSON();
		if (data === this.saved) return;
		log.trace('App.save', data);
		set_in_storage(this.storage_key, data);
		this.saved = data;
	}

	save_project = (id: ProjectId): void => {
		log.trace('save_project', id);
		const project_def = this.project_defs.peek().find((p) => p.id === id);
		set_in_storage(id, project_def); // correctly deletes the storage key if `undefined`
		const app_data = this.app_data.peek();
		const {projects} = app_data;
		if (project_def) {
			if (!projects.some((p) => p.id === id)) {
				this.app_data.value = {projects: projects.concat({id, name: project_def.name})};
			}
		} else {
			if (projects.some((p) => p.id === id)) {
				this.app_data.value = {projects: projects.filter((p) => p.id !== id)};
			}
		}
	};

	load_project = (id: ProjectId | null): ProjectDef | null => {
		log.trace('load_project', id);
		const loaded = id ? load_from_storage(id, null, ProjectDef.parse) : null;
		log.trace(`loaded`, loaded);
		if (loaded) {
			// TODO batch if this code stays imperative like this
			this.project_defs.value = this.project_defs.peek().concat(loaded);
			return loaded;
		} else {
			log.trace(`load_project failed, creating new`, id);
			const def = create_project_def();
			this.create_project(def);
			return def;
		}
	};

	select_project = (id: ProjectId | null): void => {
		log.trace('select_project', id);
		if (!id) {
			this.selected_project_def.value = null;
			return;
		}
		const def = this.project_defs.peek().find((d) => d.id === id) || this.load_project(id);
		this.selected_project_def.value = def;
		this.editing_project_def.value = def;
	};

	edit_project = (project_def: ProjectDef | null): void => {
		log.trace('edit_project', project_def);
		this.editing_project.value = !!project_def;
		this.editing_project_def.value = project_def;
		if (project_def) this.selected_project_def.value = project_def;
	};

	remove_project = (id: ProjectId): void => {
		log.trace('remove_project', id);
		const {projects} = this.app_data.peek();
		const existing = projects.find((d) => d.id === id);
		if (!existing) return;
		// TODO syncing `app_data` with `project_defs` is awkward
		this.app_data.value = {
			...this.app_data.peek(),
			projects: projects.filter((p) => p.id !== id),
		};
		this.project_defs.value = this.project_defs.peek().filter((p) => p.id !== id);
		if (this.selected_project_def.peek()?.id === id) {
			this.selected_project_def.value =
				this.project_defs.peek()[0] ||
				this.load_project(this.app_data.peek().projects[0]?.id) ||
				null;
		}
		this.save_project(id);
	};

	create_project = (project_def: ProjectDef): void => {
		log.trace('create_project', project_def);
		const project_defs = this.project_defs.peek();
		const {id} = project_def;
		const existing = project_defs.find((d) => d.id === id);
		if (existing) {
			log.trace('project already exists', project_def, existing);
			return;
		}
		// TODO syncing `app_data` with `project_defs` is awkward
		this.app_data.value = {
			...this.app_data.peek(),
			projects: this.app_data.peek().projects.concat({id, name: project_def.name}),
		};
		this.project_defs.value = project_defs.concat(project_def);
		this.selected_project_def.value = project_def;
		this.save_project(id);
	};

	update_project = (project_def: ProjectDef): void => {
		log.trace('update_project', project_def);
		const project_defs = this.project_defs.peek();
		const {id} = project_def;
		const index = project_defs.findIndex((p) => p.id === id);
		if (index === -1) {
			console.error('cannot find project_def to update', id, project_defs);
			return; // no active project
		}
		const existing = project_defs[index];
		// TODO syncing `app_data` with `project_defs` is awkward
		if (project_def.name !== existing.name) {
			const app_data = this.app_data.peek();
			this.app_data.value = {
				...app_data,
				projects: app_data.projects.map((p) =>
					p.id === id ? {id: p.id, name: project_def.name} : p,
				),
			};
		}
		const updated = project_defs.slice();
		updated[index] = project_def;
		this.project_defs.value = updated;
		// TODO this is awkward, could be the id and not need manual updating, or maybe store signals
		if (this.selected_project_def.peek()?.id === id) {
			this.selected_project_def.value = project_def;
		}
		if (this.editing_project_def.peek()?.id === id) {
			this.editing_project_def.value = project_def;
		}
		this.save_project(id);
	};

	play_level_def = async (id: LevelId): Promise<void> => {
		log.trace('play_level_def', id);
		const level_def = this.level_defs.peek()?.find((d) => d.id === id);
		if (!level_def) {
			console.error('cannot find level_def with id', id);
			return;
		}
		void this.get_ac().resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `play_level_def` is called without a user action
		this.editing_level_def.value = level_def; // for better UX, so when the user navigates back it's still being edited
		await goto(to_play_level_url(level_def));
	};

	edit_level_def = (id: LevelId | null): void => {
		const level_def = (id && this.level_defs.peek()?.find((d) => d.id === id)) || null;
		log.trace('edit_level_def', level_def);
		this.editing_level_def.value = level_def;
	};

	remove_level_def = (id: LevelId): void => {
		log.trace('remove_level_def', id);
		const project_def = this.selected_project_def.peek();
		if (!project_def) {
			console.error('cannot remove level_def without a project', project_def, id);
			return; // no active project
		}
		const {level_defs} = project_def;
		const level_def = level_defs.find((d) => d.id === id);
		if (!level_def) {
			console.error('cannot find level_def with id', id);
			return;
		}
		if (id === this.editing_level_def.value?.id) {
			this.editing_level_def.value = null;
		}
		this.update_project({
			...project_def,
			level_defs: level_defs.filter((d) => d !== level_def),
		});
	};

	// TODO inconsistent naming with `realm` having the `_def` prefix here
	create_level_def = (level_def: LevelDef): void => {
		log.trace('create_level_def', level_def);
		const project_def = this.selected_project_def.peek();
		if (!project_def) {
			console.error('cannot create level_def without a project', project_def, level_def);
			return; // no active project
		}
		const {level_defs} = project_def;
		// TODO is it weird that these access both `this.level_defs` and the source of truth `project_def`,
		// or would it be better to always go through the `project_def`?
		const existing = level_defs.find((d) => d.id === level_def.id);
		if (existing) {
			log.trace('level_def already exists', level_def, existing);
			return;
		}

		this.update_project({...project_def, level_defs: [level_def].concat(level_defs)});
		this.editing_level_def.value = level_def;
	};

	update_level_def = (level_def: LevelDef): void => {
		log.trace('update_level_def', level_def);
		const project_def = this.selected_project_def.peek();
		if (!project_def) {
			console.error('cannot update level_def without a project', project_def, level_def);
			return; // no active project
		}
		const {level_defs} = project_def;
		const {id} = level_def;
		const index = level_defs.findIndex((d) => d.id === id);
		if (index === -1) {
			console.error('cannot find level_def to update', id, level_defs);
			return;
		}
		const updated = level_defs.slice();
		updated[index] = level_def;
		this.update_project({...project_def, level_defs: updated});
		this.editing_level_def.value = level_def;
	};

	select_realm = (id: RealmId | null): void => {
		log.trace('select_realm', id);
		if (!id) {
			this.selected_realm_def.value = null;
			return;
		}
		const def = this.realm_defs.peek()?.find((d) => d.id === id);
		if (!def) return; // TODO hm
		this.selected_realm_def.value = def;
		this.editing_realm_def.value = def;
	};

	edit_realm = (id: RealmId | null): void => {
		const realm_def = (id && this.realm_defs.peek()?.find((d) => d.id === id)) || null;
		log.trace('edit_realm', realm_def);
		this.editing_realm_def.value = realm_def;
		if (realm_def) {
			this.editing_realm.value = true;
			this.selected_realm_def.value = realm_def;
		}
	};

	remove_realm = (id: RealmId): void => {
		log.trace('remove_realm_def', id);
		const project_def = this.selected_project_def.peek();
		if (!project_def) {
			console.error('cannot remove realm_def without a project', project_def, id);
			return; // no active project
		}
		const {realm_defs} = project_def;
		const realm_def = realm_defs.find((d) => d.id === id);
		if (!realm_def) {
			console.error('cannot find realm_def with id', id);
			return;
		}
		if (id === this.editing_realm_def.value?.id) {
			this.editing_realm_def.value = null;
		}
		this.update_project({
			...project_def,
			realm_defs: realm_defs.filter((d) => d !== realm_def),
		});
	};

	create_realm = (realm_def: RealmDef): void => {
		log.trace('create_realm', realm_def);
		const project_def = this.selected_project_def.peek();
		if (!project_def) {
			console.error('cannot create a realm_def without a project', project_def, realm_def);
			return; // no active project
		}
		const {realm_defs} = project_def;
		// TODO is it weird that these access both `this.realm_defs` and the source of truth `project_def`,
		// or would it be better to always go through the `project_def`?
		const existing = realm_defs.find((d) => d.id === realm_def.id);
		if (existing) {
			log.trace('realm_def already exists', realm_def, existing);
			return;
		}

		this.update_project({...project_def, realm_defs: [realm_def].concat(realm_defs)});
		this.editing_realm_def.value = realm_def;
		this.selected_realm_def.value = realm_def;
	};

	update_realm = (realm_def: RealmDef): void => {
		log.trace('update_realm_def', realm_def);
		const project_def = this.selected_project_def.peek();
		if (!project_def) {
			console.error('cannot update realm_def without a project', project_def, realm_def);
			return; // no active project
		}
		const {realm_defs} = project_def;
		const {id} = realm_def;
		const index = realm_defs.findIndex((d) => d.id === id);
		if (index === -1) {
			console.error('cannot find realm_def to update', id, realm_defs);
			return;
		}
		const updated = realm_defs.slice();
		updated[index] = realm_def;
		this.update_project({...project_def, realm_defs: updated});
		this.editing_realm_def.value = realm_def;
		this.selected_realm_def.value = realm_def;
	};

	register_success = (id: LevelId, mistakes: number): void => {
		const project_def = this.selected_project_def.peek();
		if (!project_def) return;
		this.update_project({
			...project_def,
			level_stats: add_mistakes_to_level_stats(project_def.level_stats, id, mistakes),
		});
	};

	exit_level_to_map = async (): Promise<void> => {
		log.trace('exit_level_to_map');
		const $active_level_def = this.active_level_def.peek();
		if (!$active_level_def) return;
		this.active_level_def.value = null;
		await goto('#');
	};
}
