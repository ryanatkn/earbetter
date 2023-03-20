import {z} from 'zod';

import {ProjectId} from '$lib/earbetter/project';

export const AppData = z.object({
	projects: z.array(ProjectId),
});
export type AppData = z.infer<typeof AppData>;

export const DEFAULT_APP_DATA: AppData = {projects: []};
