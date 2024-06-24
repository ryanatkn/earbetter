import {goto} from '$app/navigation';
import {z} from 'zod';
import {
	signal,
	type Signal,
	computed,
	effect,
	type ReadonlySignal,
	batch,
} from '@preact/signals-core';
import {getContext, setContext} from 'svelte';
import {Logger} from '@ryanatkn/belt/log.js';

import {
	add_mistakes_to_level_stats,
	to_play_level_url,
	type Level,
	LevelData,
	type LevelId,
} from '$lib/earbetter/level.js';
import {ProjectData, ProjectId, ProjectName} from '$lib/earbetter/project';
import {load_from_storage, set_in_storage} from '$lib/storage.js';
import {RealmId, RealmData} from '$lib/earbetter/realm';
import default_project_data from '$lib/projects/default_project';
import {to_next_name} from '$lib/entity';

const log = new Logger('[app]');

// TODO maybe a `@batched` or `@action` decorator instead of manual `batch`?

// TODO refactor all storage calls, and rethink in signals instead of all top-level orchestration (that's less reusable)

export const AppData = z.object({
	projects: z.array(z.object({id: ProjectId, name: ProjectName})).default([]),
	selected_project_id: z.union([ProjectId, z.null()]).default(null),
	selected_realm_id: z.union([RealmId, z.null()]).default(null),
	show_game_help: z.boolean().default(true),
});
export type AppData = z.infer<typeof AppData>;

const APP_KEY = Symbol('app');
export const get_app = (): App => getContext(APP_KEY);
export const set_app = (store: App): App => setContext(APP_KEY, store);

export class App {
	// TODO wheres the source of truth?
	// currently manually syncing the same changes to both `app_data` `projects` --
	// mixing serialization concerns with runtime representations
	app_data: Signal<AppData>;

	show_game_help: ReadonlySignal<boolean> = computed(() => this.app_data.value.show_game_help);
	toggle_game_help = (): void => {
		this.app_data.value = {...this.app_data.peek(), show_game_help: !this.show_game_help.peek()};
	};

	project_datas: Signal<ProjectData[]> = signal([]);

	selected_project_id: Signal<ProjectId | null> = signal(null);
	selected_project_data: ReadonlySignal<ProjectData | null> = computed(() => {
		const id = this.selected_project_id.value;
		return this.project_datas.value.find((p) => p.id === id) || null;
	});
	realms: ReadonlySignal<RealmData[] | null> = computed(
		() => this.selected_project_data.value?.realms || null,
	);
	editing_project: Signal<boolean> = signal(false);
	editing_project_draft: Signal<boolean> = signal(false);
	draft_project_data: Signal<ProjectData | null> = signal(null);
	editing_project_id: ReadonlySignal<ProjectId | null> = computed(() =>
		this.editing_project_draft.value
			? this.draft_project_data.value?.id || null
			: this.selected_project_data.value?.id || null,
	); // this may be `selected_project_data`, or a new project def draft that hasn't been created yet
	editing_project_data: ReadonlySignal<ProjectData | null> = computed(() =>
		this.editing_project_draft.value
			? this.draft_project_data.value
			: this.selected_project_data.value,
	);

	selected_realm_id: Signal<RealmId | null> = signal(null);
	selected_realm_data: ReadonlySignal<RealmData | null> = computed(() => {
		const id = this.selected_realm_id.value;
		return this.realms.value?.find((p) => p.id === id) || null;
	});
	editing_realm: Signal<boolean> = signal(false);
	editing_realm_draft: Signal<boolean> = signal(false);
	draft_realm_data: Signal<RealmData | null> = signal(null);
	editing_realm_id: ReadonlySignal<RealmId | null> = computed(() =>
		this.editing_realm_draft.value
			? this.draft_realm_data.value?.id || null
			: this.selected_realm_data.value?.id || null,
	); // this may be `selected_realm_data`, or a new realm def draft that hasn't been created yet
	editing_realm_data: ReadonlySignal<RealmData | null> = computed(() =>
		this.editing_realm_draft.value ? this.draft_realm_data.value : this.selected_realm_data.value,
	);

	level: Signal<Level | null> = signal(null); // TODO set hackily

	levels: ReadonlySignal<LevelData[] | null> = computed(
		() => this.selected_realm_data.value?.levels || null,
	);
	active_level_data: Signal<LevelData | null> = signal(null);
	editing_level: Signal<boolean> = signal(false);
	draft_level_data: Signal<LevelData | null> = signal(null);

	constructor(
		public readonly get_ac: () => AudioContext,
		public readonly storage_key = 'app',
	) {
		// TODO maybe `new App(App.load())` ?
		this.app_data = signal(this.load());
		const app_data = this.app_data.peek();
		this.saved = app_data; // hacky, but enables the following effect without waste
		effect(() => this.save()); // TODO do effects like this need to be cleaned up or is calling dispose only for special cases?
		log.debug(`app_data`, app_data);

		// TODO refactor
		const {selected_project_id} = app_data;
		const project_data = this.load_project(
			selected_project_id ||
				app_data.projects[0]?.id ||
				this.create_project(default_project_data()).id,
		)!;
		this.selected_project_id.value = project_data.id;
		this.selected_realm_id.value = app_data.selected_realm_id || project_data.realms[0]?.id || null;
		// save changes to `selected_project_id` and `selected_realm_id` back to the `app_data`,
		// these could be decoupled but are often fired together
		effect(() => {
			const app_data = this.app_data.peek();
			const selected_project_id = this.selected_project_id.value;
			const selected_realm_id = this.selected_realm_id.value;
			if (
				selected_project_id !== app_data.selected_project_id ||
				selected_realm_id !== app_data.selected_realm_id
			) {
				this.app_data.value = {...app_data, selected_project_id, selected_realm_id};
			}
		});
	}

	// returns a stable reference to data that's immutable by convention
	toJSON(): AppData {
		return this.app_data.value;
	}

	load(): AppData {
		const loaded = load_from_storage(this.storage_key, () => AppData.parse({}), AppData.parse);
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
		log.debug('save', data);
		set_in_storage(this.storage_key, data);
		this.saved = data;
	}

	save_project = (id: ProjectId): void => {
		log.debug('save_project', id);
		const project_data = this.project_datas.peek().find((p) => p.id === id);
		set_in_storage(id, project_data); // correctly deletes the storage key if `undefined`
		const app_data = this.app_data.peek();
		const {projects} = app_data;
		if (project_data) {
			if (!projects.some((p) => p.id === id)) {
				this.app_data.value = {
					...app_data,
					projects: projects.concat({id, name: project_data.name}),
				};
			}
		} else {
			if (projects.some((p) => p.id === id)) {
				this.app_data.value = {...app_data, projects: projects.filter((p) => p.id !== id)};
			}
		}
	};

	load_project = (id: ProjectId | null): ProjectData | null => {
		log.debug('load_project', id);
		const loaded = id ? load_from_storage(id, null, ProjectData.parse) : null;
		log.debug(`loaded`, loaded);
		if (loaded) {
			// TODO batch if this code stays imperative like this
			this.project_datas.value = this.project_datas.peek().concat(loaded);
			return loaded;
		} else {
			log.debug(`load_project failed, creating new`, id);
			const project_data = ProjectData.parse({});
			this.create_project(project_data);
			return project_data;
		}
	};

	select_project = (id: ProjectId | null): void => {
		log.debug('select_project', id);
		if (!id) {
			this.selected_project_id.value = null;
			return;
		}
		batch(() => {
			const project_data =
				this.project_datas.peek().find((d) => d.id === id) || this.load_project(id);
			if (!project_data) console.error('failed to find or load def', id);
			this.selected_project_id.value = project_data?.id || null;
			this.selected_realm_id.value = project_data?.realms[0]?.id || null;
		});
	};

	edit_project = (project_data: ProjectData | null): void => {
		log.debug('edit_project', project_data);
		batch(() => {
			if (!project_data) {
				this.editing_project.value = false;
				this.draft_project_data.value = null;
				return;
			}
			this.editing_project.value = true;
			const {id} = project_data;
			const found = this.project_datas.peek().find((d) => d.id === id);
			if (found) {
				// existing project
				this.selected_project_id.value = id;
				this.editing_project_draft.value = false;
			} else {
				// draft project
				this.draft_project_data.value = project_data;
				this.editing_project_draft.value = true;
			}
		});
	};

	remove_project = (id: ProjectId): void => {
		log.debug('remove_project', id);
		const {projects} = this.app_data.peek();
		const existing = projects.find((d) => d.id === id);
		if (!existing) return;
		// TODO syncing `app_data` with `projects` is awkward
		batch(() => {
			this.app_data.value = {
				...this.app_data.peek(),
				projects: projects.filter((p) => p.id !== id),
			};
			this.project_datas.value = this.project_datas.peek().filter((p) => p.id !== id);
			if (this.selected_project_id.peek() === id) {
				this.selected_project_id.value =
					this.project_datas.peek()[0]?.id ||
					this.load_project(this.app_data.peek().projects[0]?.id)?.id ||
					null;
			}
			this.save_project(id);
		});
	};

	create_project = (project_data: ProjectData): ProjectData => {
		log.debug('create_project', project_data);
		const projects = this.project_datas.peek();
		const {id} = project_data;
		const existing = projects.find((d) => d.id === id);
		if (existing) {
			log.debug('project already exists', project_data, existing);
			return existing;
		}
		batch(() => {
			// TODO syncing `app_data` with `projects` is awkward
			this.app_data.value = {
				...this.app_data.peek(),
				projects: this.app_data.peek().projects.concat({id, name: project_data.name}),
			};
			this.project_datas.value = projects.concat(project_data);
			this.selected_project_id.value = id;
			this.editing_project.value = false;
			if (this.draft_project_data.peek() === project_data) {
				this.draft_project_data.value = null;
			}
			this.save_project(id);
		});
		return project_data;
	};

	duplicate_project = (id: ProjectId): void => {
		log.debug('duplicate_project_data', id);
		const projects = this.project_datas.peek();
		const project_data = projects.find((d) => d.id === id);
		if (!project_data) {
			console.error('cannot find project_data with id', id);
			return;
		}
		batch(() => {
			const {id: _, name, ...rest} = project_data;
			const new_project_data = ProjectData.parse({
				...rest,
				name: to_next_name(name, projects),
			});
			this.create_project(new_project_data);
			this.draft_project_data.value = new_project_data; // TODO move to component?
			this.selected_project_id.value = new_project_data.id;
			this.editing_project_draft.value = true;
			this.editing_project.value = true;
		});
	};

	update_project = (project_data: ProjectData): void => {
		log.debug('update_project', project_data);
		const projects = this.project_datas.peek();
		const {id} = project_data;
		const index = projects.findIndex((p) => p.id === id);
		if (index === -1) {
			console.error('cannot find project_data to update', id, projects);
			return; // no active project
		}
		const existing = projects[index];
		// TODO syncing `app_data` with `projects` is awkward
		if (project_data.name !== existing.name) {
			const app_data = this.app_data.peek();
			this.app_data.value = {
				...app_data,
				projects: app_data.projects.map((p) =>
					p.id === id ? {id: p.id, name: project_data.name} : p,
				),
			};
		}
		const updated = projects.slice();
		updated[index] = project_data;
		this.project_datas.value = updated;
		this.save_project(id);
	};

	select_realm = (id: RealmId | null): void => {
		log.debug('select_realm', id);
		if (!id) {
			this.selected_realm_id.value = null;
			return;
		}
		const realm_data = this.realms.peek()?.find((d) => d.id === id);
		if (!realm_data) return; // TODO hm, report an error? how to handle?
		batch(() => {
			this.selected_realm_id.value = id;
			this.editing_realm_draft.value = false;
			// TODO derive instead of manually checking? might not be needed with a restructuring that saves the editing state in the tree
			if (
				this.draft_level_data.peek() &&
				!realm_data.levels.includes(this.draft_level_data.peek()!)
			) {
				this.draft_level_data.value = null;
			}
		});
	};

	edit_realm = (realm_data: RealmData | null): void => {
		log.debug('edit_realm', realm_data);
		batch(() => {
			if (!realm_data) {
				this.editing_realm.value = false;
				this.draft_realm_data.value = null;
				return;
			}
			this.editing_realm.value = true;
			const {id} = realm_data;
			const found = this.realms.peek()?.find((d) => d.id === id);
			if (found) {
				// existing realm
				this.selected_realm_id.value = id;
				this.editing_realm_draft.value = false;
			} else {
				// draft realm
				this.draft_realm_data.value = realm_data;
				this.editing_realm_draft.value = true;
			}
		});
	};

	remove_realm = (id: RealmId): void => {
		log.debug('remove_realm_data', id);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot remove realm_data without a project', project_data, id);
			return; // no active project
		}
		const {realms} = project_data;
		const realm_data = realms.find((d) => d.id === id);
		if (!realm_data) {
			console.error('cannot find realm_data with id', id);
			return;
		}
		if (id === this.editing_realm_id.peek()) {
			this.editing_realm.value = false; // TODO move to component?
		}
		if (id === this.selected_realm_id.peek()) {
			this.selected_realm_id.value = null;
		}
		this.update_project({
			...project_data,
			realms: realms.filter((d) => d !== realm_data),
		});
	};

	duplicate_realm = (id: RealmId): void => {
		log.debug('duplicate_realm_data', id);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot duplicate realm_data without a project', project_data, id);
			return; // no active project
		}
		const {realms} = project_data;
		const realm_data = realms.find((d) => d.id === id);
		if (!realm_data) {
			console.error('cannot find realm_data with id', id);
			return;
		}
		batch(() => {
			const {id: _, name, ...rest} = realm_data;
			const new_realm_data = RealmData.parse({...rest, name: to_next_name(name, realms)});
			this.create_realm(new_realm_data);
			this.draft_realm_data.value = new_realm_data; // TODO move to component?
			this.selected_realm_id.value = new_realm_data.id;
		});
	};

	create_realm = (realm_data: RealmData): void => {
		log.debug('create_realm', realm_data);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot create a realm_data without a project', project_data, realm_data);
			return; // no active project
		}
		const {realms} = project_data;
		// TODO is it weird that these access both `this.realms` and the source of truth `project_data`,
		// or would it be better to always go through the `project_data`?
		const existing = realms.find((d) => d.id === realm_data.id);
		if (existing) {
			log.debug('realm_data already exists', realm_data, existing);
			return;
		}

		batch(() => {
			this.update_project({...project_data, realms: realms.concat(realm_data)});
			this.selected_realm_id.value = realm_data.id;
			// TODO is awkward but works, should it be an effect?
			if (this.draft_realm_data.peek()?.id === realm_data.id) {
				this.editing_realm.value = false;
			}
		});
	};

	update_realm = (realm_data: RealmData): void => {
		log.debug('update_realm_data', realm_data);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot update realm_data without a project', project_data, realm_data);
			return; // no active project
		}
		const {realms} = project_data;
		const {id} = realm_data;
		const index = realms.findIndex((d) => d.id === id);
		if (index === -1) {
			console.error('cannot find realm_data to update', id, realms);
			return;
		}
		const updated = realms.slice();
		updated[index] = realm_data;
		batch(() => {
			this.update_project({...project_data, realms: updated});
			this.selected_realm_id.value = id;
		});
	};

	play_level = async (id: LevelId): Promise<void> => {
		log.debug('play_level', id);
		const level_data = this.levels.peek()?.find((d) => d.id === id);
		if (!level_data) {
			console.error('cannot find level_data with id', id);
			return;
		}
		void this.get_ac().resume(); // TODO where's the best place for this? needs to be synchronous with a click or similar, so this breaks if `play_level` is called without a user action
		this.draft_level_data.value = level_data; // for better UX, so when the user navigates back it's still being edited
		await goto(to_play_level_url(level_data));
	};

	edit_level = (level_data: LevelData | null): void => {
		log.debug('edit_level', level_data);
		batch(() => {
			this.editing_level.value = !!level_data;
			this.draft_level_data.value = level_data;
		});
	};

	remove_level = (id: LevelId): void => {
		log.debug('remove_level', id);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot remove level_data without a project', project_data, id);
			return; // no active project
		}
		const {realms} = project_data;
		for (let i = 0; i < realms.length; i++) {
			const realm_data = realms[i];
			const {levels} = realm_data;
			const level_data_index = levels.findIndex((d) => d.id === id);
			if (level_data_index === -1) continue;
			batch(() => {
				if (id === this.draft_level_data.value?.id) {
					this.draft_level_data.value = null;
				}
				const next_realms = realms.slice();
				const next_levels = levels.slice();
				next_levels.splice(level_data_index, 1);
				next_realms[i] = {...realm_data, levels: next_levels};
				this.update_project({...project_data, realms: next_realms});
			});
			return;
		}
		console.error('cannot find level_data with id', id);
	};

	// TODO inconsistent naming with `realm` having the `_def` prefix here
	create_level = (level_data: LevelData): void => {
		log.debug('create_level', level_data);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot create level_data without a project', project_data, level_data);
			return; // no active project
		}
		const {realms} = project_data;
		const realm_data = this.selected_realm_data.peek();
		if (!realm_data) {
			console.error('cannot create level_data without a selected realm');
			return;
		}
		const {levels} = realm_data;

		const existing = levels.find((d) => d.id === level_data.id);
		if (existing) {
			log.debug('level_data already exists', level_data, existing);
			return;
		}

		const next_realms = realms.slice();
		const realm_data_index = realms.indexOf(realm_data);
		if (realm_data_index === -1) {
			console.error('expected selected realm def to be in array', realm_data, realms);
			return;
		}
		next_realms[realm_data_index] = {
			...realm_data,
			levels: realm_data.levels.concat(level_data),
		};

		batch(() => {
			this.update_project({...project_data, realms: next_realms});
			this.editing_level.value = false;
			this.draft_level_data.value = null;
		});

		return;
	};

	duplicate_level = (id: LevelId): void => {
		log.debug('duplicate_level_data', id);
		const realm_data = this.selected_realm_data.peek();
		if (!realm_data) {
			console.error('cannot duplicate level_data without a realm', realm_data, id);
			return; // no active realm
		}
		const {levels} = realm_data;
		const level_data = levels.find((d) => d.id === id);
		if (!level_data) {
			console.error('cannot find level_data with id', id);
			return;
		}
		batch(() => {
			const {id: _, name, ...rest} = level_data;
			const new_level_data = LevelData.parse({...rest, name: to_next_name(name, levels)});
			this.create_level(new_level_data);
			this.editing_level.value = true;
			this.draft_level_data.value = new_level_data; // TODO move to component?
		});
	};

	update_level = (level_data: LevelData): void => {
		log.debug('update_level', level_data);
		const project_data = this.selected_project_data.peek();
		if (!project_data) {
			console.error('cannot update level_data without a project', project_data, level_data);
			return; // no active project
		}
		const {realms} = project_data;
		const {id} = level_data;
		for (let i = 0; i < realms.length; i++) {
			const realm_data = realms[i];
			const {levels} = realm_data;
			const level_data_index = levels.findIndex((d) => d.id === id);
			if (level_data_index === -1) continue;
			batch(() => {
				const next_levels = levels.slice();
				next_levels[level_data_index] = level_data;
				const next_realms = realms.slice();
				next_realms[i] = {...realm_data, levels: next_levels};
				this.update_project({...project_data, realms: next_realms});
				this.draft_level_data.value = level_data; // TODO maybe push to the component?
			});
			return;
		}
		console.error('cannot find level_data with id', id);
	};

	register_success = (id: LevelId, mistakes: number): void => {
		const project_data = this.selected_project_data.peek();
		if (!project_data) return;
		this.update_project({
			...project_data,
			level_stats: add_mistakes_to_level_stats(project_data.level_stats, id, mistakes),
		});
	};

	exit_level_to_map = async (): Promise<void> => {
		log.debug('exit_level_to_map');
		const $active_level_data = this.active_level_data.peek();
		if (!$active_level_data) return;
		this.active_level_data.value = null;
		await goto('#');
	};
}
