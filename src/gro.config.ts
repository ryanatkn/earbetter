import type {GroConfigCreator, GroConfigPartial} from '@feltjs/gro';

import {exports} from '$lib/exports';

const create_config: GroConfigCreator = async ({dev}) => {
	const config: GroConfigPartial = {
		builds: [dev ? null : {name: 'library', platform: 'node', input: exports}],
	};
	return config;
};

export default create_config;
