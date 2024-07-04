export const noop_ssr = (): void => {
	throw new Error('Cannot call this method outside of the browser');
};
