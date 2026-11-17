import { goto } from '$app/navigation';
import * as s from '@fuzdev/fuz_schema/schema.ts';
import { create_context } from '@fuzdev/fuz_ui/context_helpers.ts';
import { resolve } from '$app/paths';
import { SvelteSet } from 'svelte/reactivity';
import type { Attachment } from 'svelte/attachments';

import {
	add_mistakes_to_level_stats,
	to_level_url,
	Level,
	LevelData,
	type LevelId
} from './level.svelte.ts';
import { ProjectData, ProjectId, ProjectName } from './project.ts';
import { load_from_storage, set_in_storage } from '../storage.ts';
import { RealmId, RealmData } from './realm.ts';
import default_project_data from '../projects/default_project.ts';
import { to_next_name } from '../entity.ts';
import { with_velocity, type Instrument, type Volume } from '../audio_helpers.ts';
import { start_playing_note, type StopPlaying } from '../play_note.ts';
import { to_notes_in_scale, type Midi, type PitchClass, type Scale } from '../music.ts';
import { MidiInputs } from '../midi_inputs.svelte.ts';
import { SiteData } from '../site_data.ts';

// TODO refactor all storage calls, and rethink in signals instead of all top-level orchestration (that's less reusable)

// strips unknown keys because it's persisted across versions
export const AppData = s.strip_object({
	projects: s.with_default_fn(
		s.array(s.strip_object({ id: ProjectId, name: ProjectName })),
		() => []
	),
	selected_project_id: s.with_default(s.nullable(ProjectId), null),
	selected_realm_id: s.with_default(s.nullable(RealmId), null),
	show_trainer_help: s.with_default(s.boolean, true)
});
export type AppData = s.Infer<typeof AppData>;

export const app_context = create_context<App>();

export interface AppOptions {
	/**
	 * The `localStorage` key for the `AppData`.
	 */
	storage_key?: string;
	/**
	 * The `localStorage` key for the `SiteData` settings.
	 */
	site_storage_key?: string;
}

/**
 * Persistence is save-on-write: the setters for `app_data` and `site_data`,
 * and the accessors built on them, write through to storage,
 * so no effect watches the state.
 *
 * Writes from other tabs flow back in through `receive_storage`,
 * which the root layout calls on the window's `storage` event.
 * They update state without writing back. Each tab keeps its own selected project and realm.
 */
export class App {
	readonly storage_key: string;
	readonly site_storage_key: string;

	// TODO wheres the source of truth?
	// currently manually syncing the same changes to both `app_data` `projects` --
	// mixing serialization concerns with runtime representations
	#app_data: AppData = $state.raw()!;
	get app_data(): AppData {
		return this.#app_data;
	}
	set app_data(value: AppData) {
		this.#app_data = value;
		set_in_storage(this.storage_key, value);
	}

	#site_data: SiteData = $state.raw()!;
	get site_data(): SiteData {
		return this.#site_data;
	}
	set site_data(value: SiteData) {
		this.#site_data = value;
		set_in_storage(this.site_storage_key, value);
	}

	/**
	 * Applies a write from another tab without writing it back.
	 * Unparseable values are ignored, keeping this tab's state.
	 * @param key - the changed `localStorage` key, or `null` when storage was cleared
	 * @param value - the new serialized value, or `null` when the key was removed
	 */
	receive_storage(key: string | null, value: string | null): void {
		if (key === null) return;
		if (key === this.site_storage_key) {
			const parsed = parse_stored(SiteData, value);
			if (parsed) this.#site_data = parsed;
		} else if (key === this.storage_key) {
			const parsed = parse_stored(AppData, value);
			if (!parsed) return;
			const { selected_project_id, selected_realm_id } = this.#app_data;
			this.#app_data = { ...parsed, selected_project_id, selected_realm_id };
		} else {
			const index = this.project_datas.findIndex((p) => p.id === key);
			if (index === -1) return; // projects not loaded in this tab load when selected
			if (value === null) {
				this.project_datas = this.project_datas.filter((p) => p.id !== key);
				if (this.selected_project_id === key)
					this.select_project(this.project_datas[0]?.id ?? null);
				return;
			}
			const parsed = parse_stored(ProjectData, value);
			if (!parsed) return;
			const updated = this.project_datas.slice();
			updated[index] = parsed;
			this.project_datas = updated;
		}
	}

	get volume(): Volume {
		return this.site_data.volume;
	}
	set volume(volume: Volume) {
		if (volume !== this.site_data.volume) this.site_data = { ...this.site_data, volume };
	}
	get instrument(): Instrument {
		return this.site_data.instrument;
	}
	set instrument(instrument: Instrument) {
		if (instrument !== this.site_data.instrument) {
			this.site_data = { ...this.site_data, instrument };
		}
	}
	get scale(): Scale {
		return this.site_data.scale;
	}
	set scale(scale: Scale) {
		if (scale !== this.site_data.scale) this.site_data = { ...this.site_data, scale };
	}
	get key(): PitchClass {
		return this.site_data.key;
	}
	set key(key: PitchClass) {
		if (key !== this.site_data.key) this.site_data = { ...this.site_data, key };
	}
	enabled_notes: Set<Midi> | null = $derived(
		this.scale.name === 'chromatic' ? null : to_notes_in_scale(this.scale, this.key)
	);
	playing_notes: SvelteSet<Midi> = new SvelteSet();

	/**
	 * Holds the result of `navigator.requestMIDIAccess`.
	 */
	midi_access: MIDIAccess | null = $state(null);
	#midi_inputs: MidiInputs | null = $derived(this.midi_access && new MidiInputs(this.midi_access));
	/**
	 * The connected MIDI inputs, updated as devices connect and disconnect.
	 */
	get midi_inputs(): Array<MIDIInput> | null {
		return this.#midi_inputs?.current ?? null;
	}

	/**
	 * The mounted level and realm forms, registered by their `register_form` attachments,
	 * so other components' event handlers can focus or scroll to them.
	 * Plain fields rather than state, because nothing renders from them.
	 */
	readonly form_els: Record<'level' | 'realm', HTMLFormElement | null> = {
		level: null,
		realm: null
	};

	register_form =
		(kind: 'level' | 'realm'): Attachment<HTMLFormElement> =>
		(el) => {
			this.form_els[kind] = el;
			return () => {
				if (this.form_els[kind] === el) this.form_els[kind] = null;
			};
		};

	/**
	 * The stop functions of the notes held by `start_note`, enforcing at most one of each note.
	 */
	readonly #held_notes: Map<Midi, StopPlaying> = new Map();

	/**
	 * Starts holding `note` until `stop_note`, with the app's instrument and its volume
	 * scaled by `velocity`, like from a MIDI key. A note already held is left as is.
	 */
	start_note = (note: Midi, velocity: number | null = null): void => {
		if (this.#held_notes.has(note)) return;
		this.#held_notes.set(
			note,
			start_playing_note(
				this,
				this.get_audio_context(),
				note,
				with_velocity(this.volume, velocity),
				this.instrument
			)
		);
	};

	stop_note = (note: Midi): void => {
		const stop = this.#held_notes.get(note);
		if (!stop) return;
		stop();
		this.#held_notes.delete(note);
	};

	show_trainer_help: boolean = $derived(this.app_data.show_trainer_help);
	toggle_trainer_help = (): void => {
		this.app_data = {
			...this.app_data,
			show_trainer_help: !this.show_trainer_help
		};
	};

	project_datas: ReadonlyArray<ProjectData> = $state.raw([]); // TODO weird name

	get selected_project_id(): ProjectId | null {
		return this.app_data.selected_project_id;
	}
	set selected_project_id(selected_project_id: ProjectId | null) {
		if (selected_project_id !== this.app_data.selected_project_id) {
			this.app_data = { ...this.app_data, selected_project_id };
		}
	}
	selected_project_data: ProjectData | null = $derived(
		this.project_datas.find((p) => p.id === this.selected_project_id) ?? null
	);
	realms: Array<RealmData> | null = $derived(this.selected_project_data?.realms ?? null);
	editing_project: boolean = $state(false);
	editing_project_draft: boolean = $state(false);
	draft_project_data: ProjectData | null = $state.raw(null);
	editing_project_id: ProjectId | null = $derived(
		this.editing_project_draft
			? (this.draft_project_data?.id ?? null)
			: (this.selected_project_data?.id ?? null)
	); // this may be `selected_project_data`, or a new project def draft that hasn't been created yet
	editing_project_data: ProjectData | null = $derived(
		this.editing_project_draft ? this.draft_project_data : this.selected_project_data
	);

	get selected_realm_id(): RealmId | null {
		return this.app_data.selected_realm_id;
	}
	set selected_realm_id(selected_realm_id: RealmId | null) {
		if (selected_realm_id !== this.app_data.selected_realm_id) {
			this.app_data = { ...this.app_data, selected_realm_id };
		}
	}
	selected_realm_data: RealmData | null = $derived(
		this.realms?.find((p) => p.id === this.selected_realm_id) ?? null
	);
	editing_realm: boolean = $state(false);
	editing_realm_draft: boolean = $state(false);
	draft_realm_data: RealmData | null = $state.raw(null);
	editing_realm_id: RealmId | null = $derived(
		this.editing_realm_draft
			? (this.draft_realm_data?.id ?? null)
			: (this.selected_realm_data?.id ?? null)
	); // this may be `selected_realm_data`, or a new realm def draft that hasn't been created yet
	editing_realm_data: RealmData | null = $derived(
		this.editing_realm_draft ? this.draft_realm_data : this.selected_realm_data
	);

	/**
	 * Sourced from the URL hash on the `/level` route.
	 */
	active_level_data: LevelData | null = $state.raw(null);

	level: Level | null = $derived.by(() => {
		return this.active_level_data
			? new Level(this, this.active_level_data, this.get_audio_context, this.register_success)
			: null;
	});

	levels: Array<LevelData> | null = $derived(this.selected_realm_data?.levels ?? null);
	editing_level: boolean = $state(false);
	draft_level_data: LevelData | null = $state.raw(null);

	readonly get_audio_context: () => AudioContext;

	constructor(get_audio_context: () => AudioContext, options?: AppOptions) {
		this.get_audio_context = get_audio_context;
		this.storage_key = options?.storage_key ?? 'app';
		this.site_storage_key = options?.site_storage_key ?? 'site';
		// loading assigns the private fields, so it doesn't write back what it just read
		this.#app_data = this.load();
		this.#site_data = load_from_storage(
			this.site_storage_key,
			() => s.parse_or_throw(SiteData, {}),
			(v) => s.parse_or_throw(SiteData, v)
		);

		// TODO refactor
		const { selected_project_id } = this.app_data;
		const project_data = this.load_project(
			selected_project_id ??
				this.app_data.projects[0]?.id ??
				this.create_project(default_project_data()).id
		)!;
		this.selected_project_id = project_data.id;
		this.selected_realm_id = this.app_data.selected_realm_id ?? project_data.realms[0]?.id ?? null;
	}

	// returns a stable reference to data that's immutable by convention
	toJSON(): AppData {
		return this.app_data;
	}

	load(): AppData {
		const loaded = load_from_storage(
			this.storage_key,
			() => s.parse_or_throw(AppData, {}),
			(v) => s.parse_or_throw(AppData, v)
		);
		let ids_to_delete: Array<ProjectId> | null = null;
		for (const p of loaded.projects) {
			if (localStorage.getItem(p.id) === null) {
				(ids_to_delete ??= []).push(p.id);
			}
		}
		if (ids_to_delete) {
			loaded.projects = loaded.projects.filter((p) => !ids_to_delete.includes(p.id));
		}
		return loaded;
	}

	save_project = (id: ProjectId): void => {
		const project_data = this.project_datas.find((p) => p.id === id);
		set_in_storage(id, project_data); // correctly deletes the storage key if `undefined`
		const app_data = this.app_data;
		const { projects } = app_data;
		if (project_data) {
			if (!projects.some((p) => p.id === id)) {
				this.app_data = {
					...app_data,
					projects: projects.concat({ id, name: project_data.name })
				};
			}
		} else {
			if (projects.some((p) => p.id === id)) {
				this.app_data = { ...app_data, projects: projects.filter((p) => p.id !== id) };
			}
		}
	};

	load_project = (id: ProjectId | null): ProjectData | null => {
		// a project created this session is already loaded, so don't add it twice
		const existing = id ? this.project_datas.find((p) => p.id === id) : undefined;
		if (existing) return existing;
		const loaded = id ? load_from_storage(id, null, (v) => s.parse_or_throw(ProjectData, v)) : null;
		if (loaded) {
			this.project_datas = this.project_datas.concat(loaded);
			return loaded;
		}
		// the project is missing or failed to parse, so stop listing it and replace it with a new one
		if (id && this.app_data.projects.some((p) => p.id === id)) {
			this.app_data = {
				...this.app_data,
				projects: this.app_data.projects.filter((p) => p.id !== id)
			};
		}
		const project_data = s.parse_or_throw(ProjectData, {});
		this.create_project(project_data);
		return project_data;
	};

	select_project = (id: ProjectId | null): void => {
		if (!id) {
			this.selected_project_id = null;
			return;
		}
		const project_data = this.project_datas.find((d) => d.id === id) ?? this.load_project(id);
		this.selected_project_id = project_data?.id ?? null;
		this.selected_realm_id = project_data?.realms[0]?.id ?? null;
	};

	edit_project = (project_data: ProjectData | null): void => {
		if (!project_data) {
			this.editing_project = false;
			this.draft_project_data = null;
			return;
		}
		this.editing_project = true;
		const { id } = project_data;
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

	remove_project = (id: ProjectId): void => {
		const { projects } = this.app_data;
		const existing = projects.find((d) => d.id === id);
		if (!existing) return;
		// TODO syncing `app_data` with `projects` is awkward
		this.app_data = {
			...this.app_data,
			projects: projects.filter((p) => p.id !== id)
		};
		this.project_datas = this.project_datas.filter((p) => p.id !== id);
		if (this.selected_project_id === id) {
			this.selected_project_id =
				this.project_datas[0]?.id ??
				this.load_project(this.app_data.projects[0]?.id ?? null)?.id ??
				null;
		}
		this.save_project(id);
	};

	create_project = (project_data: ProjectData): ProjectData => {
		const projects = this.project_datas;
		const { id } = project_data;
		const existing = projects.find((d) => d.id === id);
		if (existing) {
			return existing;
		}
		// TODO syncing `app_data` with `projects` is awkward
		this.app_data = {
			...this.app_data,
			projects: this.app_data.projects.concat({ id, name: project_data.name })
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

	duplicate_project = (id: ProjectId): void => {
		const projects = this.project_datas;
		const project_data = projects.find((d) => d.id === id);
		if (!project_data) {
			return;
		}
		const { id: _, name, ...rest } = project_data;
		const new_project_data = s.parse_or_throw(ProjectData, {
			...rest,
			name: to_next_name(name, projects)
		});
		this.create_project(new_project_data);
		this.draft_project_data = new_project_data; // TODO move to component?
		this.selected_project_id = new_project_data.id;
		this.editing_project_draft = true;
		this.editing_project = true;
	};

	update_project = (project_data: ProjectData): void => {
		const projects = this.project_datas;
		const { id } = project_data;
		const index = projects.findIndex((p) => p.id === id);
		if (index === -1) {
			return; // no active project
		}
		const existing = projects[index]!;
		// TODO syncing `app_data` with `projects` is awkward
		if (project_data.name !== existing.name) {
			const app_data = this.app_data;
			this.app_data = {
				...app_data,
				projects: app_data.projects.map((p) =>
					p.id === id ? { id: p.id, name: project_data.name } : p
				)
			};
		}
		const updated = projects.slice();
		updated[index] = project_data;
		this.project_datas = updated;
		this.save_project(id);
	};

	select_realm = (id: RealmId | null): void => {
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

	edit_realm = (realm_data: RealmData | null): void => {
		if (!realm_data) {
			this.editing_realm = false;
			this.draft_realm_data = null;
			return;
		}
		this.editing_realm = true;
		const { id } = realm_data;
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

	remove_realm = (id: RealmId): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		const realm_data = realms.find((d) => d.id === id);
		if (!realm_data) {
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
			realms: realms.filter((d) => d !== realm_data)
		});
	};

	duplicate_realm = (id: RealmId): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		const realm_data = realms.find((d) => d.id === id);
		if (!realm_data) {
			return;
		}
		const { id: _, name, levels, ...rest } = realm_data;
		// the copied levels get new ids, because level ids must be unique across the project's realms
		// for lookups like `update_level` and for `level_stats`
		const new_realm_data = s.parse_or_throw(RealmData, {
			...rest,
			name: to_next_name(name, realms),
			levels: levels.map(({ id: _, ...level }) => level)
		});
		this.create_realm(new_realm_data);
		this.draft_realm_data = new_realm_data; // TODO move to component?
		this.selected_realm_id = new_realm_data.id;
	};

	create_realm = (realm_data: RealmData, select = true): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		// TODO is it weird that these access both `this.realms` and the source of truth `project_data`,
		// or would it be better to always go through the `project_data`?
		const existing = realms.find((d) => d.id === realm_data.id);
		if (existing) {
			return;
		}

		this.update_project({ ...project_data, realms: realms.concat(realm_data) });
		if (select) this.selected_realm_id = realm_data.id;
		// TODO is awkward but works
		if (this.draft_realm_data?.id === realm_data.id) {
			this.editing_realm = false;
		}
	};

	update_realm = (realm_data: RealmData): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		const { id } = realm_data;
		const index = realms.findIndex((d) => d.id === id);
		if (index === -1) {
			return;
		}
		const updated = realms.slice();
		updated[index] = realm_data;
		this.update_project({ ...project_data, realms: updated });
		this.selected_realm_id = id;
	};

	play_level = async (id: LevelId): Promise<void> => {
		const level_data = this.levels?.find((d) => d.id === id);
		if (!level_data) {
			return;
		}
		this.draft_level_data = level_data; // for better UX, so when the user navigates back it's still being edited
		await goto(to_level_url(level_data));
	};

	edit_level = (level_data: LevelData | null): void => {
		this.editing_level = !!level_data;
		this.draft_level_data = level_data;
	};

	remove_level = (id: LevelId): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		for (let i = 0; i < realms.length; i++) {
			const realm_data = realms[i]!;
			const { levels } = realm_data;
			const level_data_index = levels.findIndex((d) => d.id === id);
			if (level_data_index === -1) continue;
			if (id === this.draft_level_data?.id) {
				this.draft_level_data = null;
			}
			const next_realms = realms.slice();
			const next_levels = levels.slice();
			next_levels.splice(level_data_index, 1);
			next_realms[i] = { ...realm_data, levels: next_levels };
			this.update_project({ ...project_data, realms: next_realms });
			return;
		}
	};

	create_level = (level_data: LevelData): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		const realm_data = this.selected_realm_data;
		if (!realm_data) {
			return;
		}
		const { levels } = realm_data;

		const existing = levels.find((d) => d.id === level_data.id);
		if (existing) {
			return;
		}

		const next_realms = realms.slice();
		const realm_data_index = realms.indexOf(realm_data);
		if (realm_data_index === -1) {
			return;
		}
		next_realms[realm_data_index] = {
			...realm_data,
			levels: realm_data.levels.concat(level_data)
		};

		this.update_project({ ...project_data, realms: next_realms });
		this.editing_level = false;
		this.draft_level_data = null;

		return;
	};

	duplicate_level = (id: LevelId): void => {
		const realm_data = this.selected_realm_data;
		if (!realm_data) {
			return; // no active realm
		}
		const { levels } = realm_data;
		const level_data = levels.find((d) => d.id === id);
		if (!level_data) {
			return;
		}
		const { id: _, name, ...rest } = level_data;
		const new_level_data = s.parse_or_throw(LevelData, {
			...rest,
			name: to_next_name(name, levels)
		});
		this.create_level(new_level_data);
		this.editing_level = true;
		this.draft_level_data = new_level_data; // TODO move to component?
	};

	update_level = (level_data: LevelData): void => {
		const project_data = this.selected_project_data;
		if (!project_data) {
			return; // no active project
		}
		const { realms } = project_data;
		const { id } = level_data;
		for (let i = 0; i < realms.length; i++) {
			const realm_data = realms[i]!;
			const { levels } = realm_data;
			const level_data_index = levels.findIndex((d) => d.id === id);
			if (level_data_index === -1) continue;
			const next_levels = levels.slice();
			next_levels[level_data_index] = level_data;
			const next_realms = realms.slice();
			next_realms[i] = { ...realm_data, levels: next_levels };
			this.update_project({ ...project_data, realms: next_realms });
			this.draft_level_data = level_data; // TODO maybe push to the component?
			return;
		}
	};

	register_success = (id: LevelId, mistakes: number): void => {
		const project_data = this.selected_project_data;
		if (!project_data) return;
		this.update_project({
			...project_data,
			level_stats: add_mistakes_to_level_stats(project_data.level_stats, id, mistakes)
		});
	};

	/**
	 * Sets the level data.
	 */
	set_active_level_data(value: LevelData | null): void {
		if (this.active_level_data === value) {
			return;
		}
		this.level?.dispose(); // TODO better way to do this? doing it in the `this.level` derived is hacky
		this.active_level_data = value;
	}

	/**
	 * Navigates to `/trainer`, which clears the active level because the URL has no level hash.
	 */
	exit_level = async (): Promise<void> => {
		await goto(resolve(`/trainer`));
	};
}

/**
 * Parses a serialized storage value from another tab, or `null` if it's missing or invalid.
 */
const parse_stored = <T extends s.Schema>(schema: T, value: string | null): s.Infer<T> | null => {
	if (value === null) return null;
	try {
		const parsed = s.parse(schema, JSON.parse(value));
		return parsed.ok ? parsed.value : null;
	} catch {
		return null;
	}
};
