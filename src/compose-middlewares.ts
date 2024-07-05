// Function to compose middlewares
export function composeMiddlewares<T>(middlewares: T[]): T {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return (async (ctx: any, next: any) => {
		let index = -1;
		async function dispatch(i: number): Promise<void> {
			if (i <= index) throw new Error("next() called multiple times");
			index = i;
			let fn = middlewares[i];
			if (i === middlewares.length) fn = next;
			if (!fn) return;
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			await (fn as any)(ctx, () => dispatch(i + 1));
		}
		await dispatch(0);
	}) as unknown as T;
}
