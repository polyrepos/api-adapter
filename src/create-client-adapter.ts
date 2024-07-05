import { composeMiddlewares } from "./compose-middlewares";
import type {
	ClientMiddleware,
	ClientMiddlewareContext,
} from "./middlewares/middleware-types";

// Helper type to extract the argument and return type from a function type
type ApiMethodSignature<T> = T extends () => Promise<infer Result>
	? () => Promise<Result>
	: T extends (args: infer Args) => Promise<infer Result>
		? (args: Args) => Promise<Result>
		: never;

// Recursive type to build the nested structure of API calls
type ClientApi<T> = {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	[K in keyof T]: T[K] extends Function
		? ApiMethodSignature<T[K]>
		: ClientApi<T[K]>;
};

// Function to create the client fetch structure based on type information
export function createClientAdapter<R>(
	baseUrl: string,
	middlewares: ClientMiddleware[],
): ClientApi<R> {
	const createEndpoint = (route: string[]) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return async (body: any) => {
			const _body = body ? JSON.stringify(body) : "{}";
			const req = new Request(`${baseUrl}/${route.join("/")}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: _body,
			});
			const ctx: ClientMiddlewareContext = { req, res: null, bodyRow: _body };
			const composed = composeMiddlewares(middlewares);
			await composed(ctx, async () => {
				ctx.res = await fetch(ctx.req);
			});

			return ctx.res?.json();
		};
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const buildClient = (route: string[] = []): any => {
		return new Proxy(() => {}, {
			get(_, prop: string) {
				return buildClient([...route, prop]);
			},
			apply(_, __, args) {
				return createEndpoint(route)(args[0]);
			},
		});
	};

	return buildClient([]);
}
