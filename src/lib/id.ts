// TODO ideally would use `crypto.randomUUID()` but don't want to break older browsers
export const to_random_id = (): string => Math.random().toString().slice(2);
