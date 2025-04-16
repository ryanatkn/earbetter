export const to_next_name = (name: string, entities: ReadonlyArray<{name: string}>): string => {
	let next_name = name;
	while (entities.some((e) => e.name === next_name)) {
		next_name += '_';
	}
	return next_name;
};
