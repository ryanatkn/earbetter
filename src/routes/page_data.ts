import type { RouteId } from '$app/types';

export interface PageData {
	slug: RouteId;
}

export const pages: Array<PageData> = [{ slug: '/trainer' }, { slug: '/piano' }, { slug: '/' }]; // TODO generate? import the data?
