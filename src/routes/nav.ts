import {goto} from '$app/navigation';
import {base} from '$app/paths';
import {randomItem} from '@feltjs/util';

const page_slugs = ['game', 'piano']; // TODO generate? import the data?

export const goto_random_page = async (): Promise<void> => {
	const path = base + '/' + randomItem(page_slugs);
	await goto(path);
};
