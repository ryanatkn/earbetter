import {goto} from '$app/navigation';
import {z} from 'zod';
import {getContext, setContext, untrack} from 'svelte';
import {base} from '$app/paths';

import {
	add_mistakes_to_level_stats,
	to_level_url,
	Level,
	Level_Data,
	type Level_Id,
} from '$lib/earbetter/level.svelte.js';
import {Project_Data, Project_Id, Project_Name} from '$lib/earbetter/project.js';
import {load_from_storage, set_in_storage} from '$lib/storage.js';
import {Realm_Id, Realm_Data} from '$lib/earbetter/realm.js';
import default_project_data from '$lib/projects/default_project.js';
import {to_next_name} from '$lib/entity.js';
import {
	DEFAULT_INSTRUMENT,
	DEFAULT_VOLUME,
	type Instrument,
	type Volume,
} from '$lib/audio_helpers.js';
import {
	DEFAULT_SCALE,
	pitch_classes,
	to_notes_in_scale,
	type Midi,
	type Pitch_Class,
	type Scale,
} from '$lib/music.js';
import type {MIDIAccess} from '$lib/WebMIDI.js';
import type {Site_Data} from '$routes/site_data.js';

// TODO maybe a `@batched` or `@action` decorator instead of manual `batch`?

// TODO refactor all storage calls, and rethink in signals instead of all top-level orchestration (that's less reusable)

export const App_Data = z.object({
	projects: z.array(z.object({id: Project_Id, name: Project_Name})).default([]),
	selected_project_id: z.union([Project_Id, z.null()]).default(null),
	selected_realm_id: z.union([Realm_Id, z.null()]).default(null),
	show_trainer_help: z.boolean().default(true),
});
export type App_Data = z.infer<typeof App_Data>;

const APP_KEY = Symbol('app');
export const get_app = (): App => getContext(APP_KEY);
export const set_app = (store: App): App => setContext(APP_KEY, store);

export class App {
	// TODO wheres the source of truth?
	// currently manually syncing the same changes to both `app_data` `projects` --
	// mixing serialization concerns with runtime representations
	app_data: App_Data = $state.frozen(this.load());

	// TODO does initializing these to the defaults without the app data cause any weirdness? creating them eagerly because we can't do `this.volume = $state(...)` in the constructor
	volume: Volume = $state(DEFAULT_VOLUME);
	instrument: Instrument = $state(DEFAULT_INSTRUMENT);
	scale: Scale = $state.frozen(DEFAULT_SCALE);
	key: Pitch_Class = $state(pitch_classes[0]);
	enabled_notes: Set<Midi> | null = $derived(
		this.scale.name === 'chromatic' ? null : to_notes_in_scale(this.scale, this.key),
	);
	playing_notes: Set<Midi> = $state(new Set());

	/**
	 * Holds the result of `navigator.requestMIDIAccess`.
	 */
	midi_access: MIDIAccess | null = $state(null);

	show_trainer_help: boolean = $derived(this.app_data.show_trainer_help);
	toggle_trainer_help = (): void => {
		this.app_data = {
			...this.app_data,
			show_trainer_help: !this.show_trainer_help,
		};
	};

	project_datas: Project_Data[] = $state([]); // TODO weird name

	selected_project_id: Project_Id | null = $state(null);
	selected_project_data: Project_Data | null = $derived(
		this.project_datas.find((p) => p.id === this.selected_project_id) ?? null,
	);
	realms: Realm_Data[] | null = $derived(this.selected_project_data?.realms ?? null);
	editing_project: boolean = $state(false);
	editing_project_draft: boolean = $state(false);
	draft_project_data: Project_Data | null = $state(null);
	editing_project_id: Project_Id | null = $derived(
		this.editing_project_draft
			? this.draft_project_data?.id ?? null
			: this.selected_project_data?.id ?? null,
	); // this may be `selected_project_data`, or a new project def draft that hasn't been created yet
	editing_project_data: Project_Data | null = $derived(
		this.editing_project_draft ? this.draft_project_data : this.selected_project_data,
	);

	selected_realm_id: Realm_Id | null = $state(null);
	selected_realm_data: Realm_Data | null = $derived(
		this.realms?.find((p) => p.id === this.selected_realm_id) ?? null,
	);
	editing_realm: boolean = $state(false);
	editing_realm_draft: boolean = $state(false);
	draft_realm_data: Realm_Data | null = $state(null);
	editing_realm_id: Realm_Id | null = $derived(
		this.editing_realm_draft
			? this.draft_realm_data?.id ?? null
			: this.selected_realm_data?.id ?? null,
	); // this may be `selected_realm_data`, or a new realm def draft that hasn't been created yet
	editing_realm_data: Realm_Data | null = $derived(
		this.editing_realm_draft ? this.draft_realm_data : this.selected_realm_data,
	);

	/**
	 * Sourced from the URL hash on the `/level` route.
	 */
	active_level_data: Level_Data | null = $state(null);

	level: Level | null = $derived.by(() => {
		console.log('computing level', this.active_level_data);
		return this.active_level_data
			? new Level(this, this.active_level_data, this.get_audio_context, this.register_success)
			: null;
	});

	levels: Level_Data[] | null = $derived(this.selected_realm_data?.levels ?? null);
	editing_level: boolean = $state(false);
	draft_level_data: Level_Data | null = $state(null);

	constructor(
		public readonly get_audio_context: () => AudioContext,
		initial_site_data: Site_Data | null = null,
		public readonly storage_key = 'app',
	) {
		console.log(`app_data`, this.app_data);

		if (initial_site_data) {
			this.volume = initial_site_data.volume;
			this.instrument = initial_site_data.instrument;
			this.scale = initial_site_data.scale;
			this.key = initial_site_data.key;
		}

		// TODO refactor
		const {selected_project_id} = this.app_data;
		const project_data = this.load_project(
			selected_project_id ?? // eslint-disable-line @typescript-eslint/no-unnecessary-condition
				this.app_data.projects[0]?.id ??
				this.create_project(default_project_data()).id,
		)!;
		this.selected_project_id = project_data.id;
		this.selected_realm_id = this.app_data.selected_realm_id ?? project_data.realms[0]?.id ?? null; // eslint-disable-line @typescript-eslint/no-unnecessary-condition
		// TODO rethink how this works - is setting state inside an $effect, and in a constructor
		// save changes to `selected_project_id` and `selected_realm_id` back to the `app_data`,
		// these could be decoupled but are often fired together
		$effect(() => {
			const app_data = untrack(() => this.app_data);
			const selected_project_id = this.selected_project_id;
			const selected_realm_id = this.selected_realm_id;
			if (
				selected_project_id !== app_data.selected_project_id ||
				selected_realm_id !== app_data.selected_realm_id
			) {
				this.app_data = {...app_data, selected_project_id, selected_realm_id};
			}
		});
	}

	// returns a stable reference to data that's immutable by convention
	toJSON(): App_Data {
		return this.app_data;
	}

	load(): App_Data {
		const loaded = load_from_storage(this.storage_key, () => App_Data.parse({}), App_Data.parse);
		let ids_to_delete: Project_Id[] | null = null;
		for (const p of loaded.projects) {
			if (localStorage.getItem(p.id) === null) {
				console.warn('deleting unknown id', p);
				(ids_to_delete ?? (ids_to_delete = [])).push(p.id);
			}
		}
		if (ids_to_delete) {
			loaded.projects = loaded.projects.filter((p) => !ids_to_delete.includes(p.id));
		}
		return loaded;
	}

	save(data: App_Data): void {
		console.log('save');
		set_in_storage(this.storage_key, data);
	}

	save_project = (id: Project_Id): void => {
		console.log('save_project', id);
		const project_data = this.project_datas.find((p) => p.id === id);
		set_in_storage(id, project_data); // correctly deletes the storage key if `undefined`
		const app_data = this.app_data;
		const {projects} = app_data;
		if (project_data) {
			if (!projects.some((p) => p.id === id)) {
				this.app_data = {
					...app_data,
					projects: projects.concat({id, name: project_data.name}),
				};
			}
		} else {
			if (projects.some((p) => p.id === id)) {
				this.app_data = {...app_data, projects: projects.filter((p) => p.id !== id)};
			}
		}
	};

	load_project = (id: Project_Id | null): Project_Data | null => {
		console.log('load_project', id);
		const loaded = id ? load_from_storage(id, null, Project_Data.parse) : null;
		console.log(`loaded`, loaded);
		if (loaded) {
			// TODO batch if this code stays imperative like this
			this.project_datas = this.project_datas.concat(loaded);
			return loaded;
		} else {
			console.log(`load_project failed, creating new`, id);
			const project_data = Project_Data.parse({});
			this.create_project(project_data);
			return project_data;
		}
	};

	select_project = (id: Project_Id | null): void => {
		console.log('select_project', id);
		if (!id) {
			this.selected_project_id = null;
			return;
		}
		const project_data = this.project_datas.find((d) => d.id === id) ?? this.load_project(id);
		if (!project_data) console.error('failed to find or load def', id);
		this.selected_project_id = project_data?.id ?? null;
		this.selected_realm_id = project_data?.realms[0]?.id ?? null;
	};

	edit_project = (project_data: Project_Data | null): void => {
		console.log('edit_project', project_data);
		if (!project_data) {
			this.editing_project = false;
			this.draft_project_data = null;
			return;
		}
		this.editing_project = true;
		const {id} = project_data;
		const found = this.project_datas.find((d) => d.id === id);
		if (found) {
			// existing project
			this.selected_project_id = id;
			this.editing_project_draft = false;
		} else {
			// draft project
			this.draft_project_data = project_data;
			this.editing_project_draft = true;
		}
	};

	remove_project = (id: Project_Id): void => {
		console.log('remove_project', id);
		const {projects} = this.app_data;
		const existing = projects.find((d) => d.id === id);
		if (!existing) return;
		// TODO syncing `app_data` with `projects` is awkward
		this.app_data = {
			...this.app_data,
			projects: projects.filter((p) => p.id !== id),
		};
		this.project_datas = this.project_datas.filter((p) => p.id !== id);
		if (this.selected_project_id === id) {
			this.selected_project_id =
				this.project_datas[0]?.id ?? // eslint-disable-line @typescript-eslint/no-unnecessary-condition
				this.load_project(this.app_data.projects[0]?.id)?.id ??
				null;
		}
		this.save_project(id);
	};

	create_project = (project_data: Project_Data): Project_Data => {
		console.log('create_project', project_data);
		const projects = this.project_datas;
		const {id} = project_data;
		const existing = projects.find((d) => d.id === id);
		if (existing) {
			console.log('project already exists', project_data, existing);
			return existing;
		}
		// TODO syncing `app_data` with `projects` is awkward
		this.app_data = {
			...this.app_data,
			projects: this.app_data.projects.concat({id, name: project_data.name}),
		};
		this.project_datas = projects.concat(project_data);
		this.selected_project_id = id;
		this.editing_project = false;
		if (this.draft_project_data === project_data) {
			this.draft_project_data = null;
		}
		this.save_project(id);
		return project_data;
	};

	duplicate_project = (id: Project_Id): void => {
		console.log('duplicate_project_data', id);
		const projects = this.project_datas;
		const project_data = projects.find((d) => d.id === id);
		if (!project_data) {
			console.error('cannot find project_data with id', id);
			return;
		}
		const {id: _, name, ...rest} = project_data;
		const new_project_data = Project_Data.parse({
			...rest,
			name: to_next_name(name, projects),
		});
		this.create_project(new_project_data);
		this.draft_project_data = new_project_data; // TODO move to component?
		this.selected_project_id = new_project_data.id;
		this.editing_project_draft = true;
		this.editing_project = true;
	};

	update_project = (project_data: Project_Data): void => {
		console.log('update_project', project_data);
		const projects = this.project_datas;
		const {id} = project_data;
		const index = projects.findIndex((p) => p.id === id);
		if (index === -1) {
			console.error('cannot find project_data to update', id, projects);
			return; // no active project
		}
		const existing = projects[index];
		// TODO syncing `app_data` with `projects` is awkward
		if (project_data.name !== existing.name) {
			const app_data = this.app_data;
			this.app_data = {
				...app_data,
				projects: app_data.projects.map((p) =>
					p.id === id ? {id: p.id, name: project_data.name} : p,
				),
			};
		}
		const updated = projects.slice();
		updated[index] = project_data;
		this.project_datas = updated;
		this.save_project(id);
	};

	select_realm = (id: Realm_Id | null): void => {
		console.log('select_realm', id);
		if (!id) {
			this.selected_realm_id = null;
			return;
		}
		const realm_data = this.realms?.find((d) => d.id === id);
		if (!realm_data) return; // TODO hm, report an error? how to handle?
		this.selected_realm_id = id;
		this.editing_realm_draft = false;
		// TODO derive instead of manually checking? might not be needed with a restructuring that saves the editing state in the tree
		if (this.draft_level_data && !realm_data.levels.includes(this.draft_level_data)) {
			this.draft_level_data = null;
		}
	};

	edit_realm = (realm_data: Realm_Data | null): void => {
		console.log('edit_realm', realm_data);
		if (!realm_data) {
			this.editing_realm = false;
			this.draft_realm_data = null;
			return;
		}
		this.editing_realm = true;
		const {id} = realm_data;
		const found = this.realms?.find((d) => d.id === id);
		if (found) {
			// existing realm
			this.selected_realm_id = id;
			this.editing_realm_draft = false;
		} else {
			// draft realm
			this.draft_realm_data = realm_data;
			this.editing_realm_draft = true;
		}
	};

	remove_realm = (id: Realm_Id): void => {
		console.log('remove_realm_data', id);
		const project_data = this.selected_project_data;
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
		if (id === this.editing_realm_id) {
			this.editing_realm = false; // TODO move to component?
		}
		if (id === this.selected_realm_id) {
			this.selected_realm_id = null;
		}
		this.update_project({
			...project_data,
			realms: realms.filter((d) => d !== realm_data),
		});
	};

	duplicate_realm = (id: Realm_Id): void => {
		console.log('duplicate_realm_data', id);
		const project_data = this.selected_project_data;
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
		const {id: _, name, ...rest} = realm_data;
		const new_realm_data = Realm_Data.parse({...rest, name: to_next_name(name, realms)});
		this.create_realm(new_realm_data);
		this.draft_realm_data = new_realm_data; // TODO move to component?
		this.selected_realm_id = new_realm_data.id;
	};

	create_realm = (realm_data: Realm_Data): void => {
		console.log('create_realm', realm_data);
		const project_data = this.selected_project_data;
		if (!project_data) {
			console.error('cannot create a realm_data without a project', project_data, realm_data);
			return; // no active project
		}
		const {realms} = project_data;
		// TODO is it weird that these access both `this.realms` and the source of truth `project_data`,
		// or would it be better to always go through the `project_data`?
		const existing = realms.find((d) => d.id === realm_data.id);
		if (existing) {
			console.log('realm_data already exists', realm_data, existing);
			return;
		}

		this.update_project({...project_data, realms: realms.concat(realm_data)});
		this.selected_realm_id = realm_data.id;
		// TODO is awkward but works, should it be an effect?
		if (this.draft_realm_data?.id === realm_data.id) {
			this.editing_realm = false;
		}
	};

	update_realm = (realm_data: Realm_Data): void => {
		console.log('update_realm_data', realm_data);
		const project_data = this.selected_project_data;
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
		this.update_project({...project_data, realms: updated});
		this.selected_realm_id = id;
	};

	play_level = async (id: Level_Id): Promise<void> => {
		console.log('play_level', id);
		const level_data = this.levels?.find((d) => d.id === id);
		if (!level_data) {
			console.error('cannot find level_data with id', id);
			return;
		}
		this.draft_level_data = level_data; // for better UX, so when the user navigates back it's still being edited
		await goto(to_level_url(level_data));
	};

	edit_level = (level_data: Level_Data | null): void => {
		console.log('edit_level', level_data);
		this.editing_level = !!level_data;
		this.draft_level_data = level_data;
	};

	remove_level = (id: Level_Id): void => {
		console.log('remove_level', id);
		const project_data = this.selected_project_data;
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
			if (id === this.draft_level_data?.id) {
				this.draft_level_data = null;
			}
			const next_realms = realms.slice();
			const next_levels = levels.slice();
			next_levels.splice(level_data_index, 1);
			next_realms[i] = {...realm_data, levels: next_levels};
			this.update_project({...project_data, realms: next_realms});
			return;
		}
		console.error('cannot find level_data with id', id);
	};

	// TODO inconsistent naming with `realm` having the `_def` prefix here
	create_level = (level_data: Level_Data): void => {
		console.log('create_level', level_data);
		const project_data = this.selected_project_data;
		if (!project_data) {
			console.error('cannot create level_data without a project', project_data, level_data);
			return; // no active project
		}
		const {realms} = project_data;
		const realm_data = this.selected_realm_data;
		if (!realm_data) {
			console.error('cannot create level_data without a selected realm');
			return;
		}
		const {levels} = realm_data;

		const existing = levels.find((d) => d.id === level_data.id);
		if (existing) {
			console.log('level_data already exists', level_data, existing);
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

		this.update_project({...project_data, realms: next_realms});
		this.editing_level = false;
		this.draft_level_data = null;

		return;
	};

	duplicate_level = (id: Level_Id): void => {
		console.log('duplicate_level_data', id);
		const realm_data = this.selected_realm_data;
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
		const {id: _, name, ...rest} = level_data;
		const new_level_data = Level_Data.parse({...rest, name: to_next_name(name, levels)});
		this.create_level(new_level_data);
		this.editing_level = true;
		this.draft_level_data = new_level_data; // TODO move to component?
	};

	update_level = (level_data: Level_Data): void => {
		console.log('update_level', level_data);
		const project_data = this.selected_project_data;
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
			const next_levels = levels.slice();
			next_levels[level_data_index] = level_data;
			const next_realms = realms.slice();
			next_realms[i] = {...realm_data, levels: next_levels};
			this.update_project({...project_data, realms: next_realms});
			this.draft_level_data = level_data; // TODO maybe push to the component?
			return;
		}
		console.error('cannot find level_data with id', id);
	};

	register_success = (id: Level_Id, mistakes: number): void => {
		const project_data = this.selected_project_data;
		if (!project_data) return;
		this.update_project({
			...project_data,
			level_stats: add_mistakes_to_level_stats(project_data.level_stats, id, mistakes),
		});
	};

	/**
	 * Sets the level data.
	 */
	set_active_level_data(value: Level_Data | null): void {
		if (this.active_level_data === value) {
			return;
		}
		console.log('setting `active_level_data`', value);
		this.level?.dispose(); // TODO better way to do this? doing it in the `this.level` derived is hacky
		this.active_level_data = value;
	}

	/**
	 * Navigates to the `/trainer` and resets the the active level to its initial `null` state.
	 * @returns `true` if the active level was exited or `false` if there was no active level
	 */
	exit_level = async (): Promise<void> => {
		await goto(`${base}/trainer`);
	};
}
