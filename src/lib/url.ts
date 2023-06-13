export const parse_from_hash = <T = any>(hash: string): T | null => {
	if (hash.length === 0) return null;
	try {
		return JSON.parse(decodeURIComponent(hash.slice(1)));
	} catch (err) {
		console.error(`failed to parse data from hash`, err);
		return null;
	}
};

// TODO maybe handle failures?
export const serialize_to_hash = (data: any): string =>
	'#' + encodeURIComponent(JSON.stringify(data));
