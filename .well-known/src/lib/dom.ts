export const find_previous_sibling = <T extends ChildNode>(
	node: ChildNode,
	matches: (n: ChildNode) => boolean,
): T | null => {
	let s: ChildNode | null | undefined = node.previousSibling;
	while (s) {
		if (matches(s)) return s as T;
		s = s.previousSibling;
	}
	return null;
};

export const find_next_sibling = <T extends ChildNode>(
	node: ChildNode,
	matches: (n: ChildNode) => boolean,
): T | null => {
	let s: ChildNode | null | undefined = node.nextSibling;
	while (s) {
		if (matches(s)) return s as T;
		s = s.nextSibling;
	}
	return null;
};
