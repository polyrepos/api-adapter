import type { Routers, ServerMiddleware } from "./middleware-types";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function flattenRoutes(routes: any, prefix = "") {
	return Object.keys(routes).reduce(
		(result, key) => {
			const newKey = prefix ? `${prefix}/${key}` : key;
			if (typeof routes[key] === "object" && !Array.isArray(routes[key])) {
				Object.assign(result, flattenRoutes(routes[key], newKey));
			} else {
				result[newKey] = routes[key];
			}
			return result;
		},
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		{} as Record<string, Function>,
	);
}

export function serverRouterMiddleware(
	prefix: string,
	routers: Routers,
	responseStack: boolean,
): ServerMiddleware {
	const routerMap = flattenRoutes(routers, prefix);
	return async (ctx, next) => {
		if (!routerMap[ctx.path] || ctx.req.method !== "POST") {
			await next();
			return;
		}
		try {
			const res = await Promise.resolve(routerMap[ctx.path](ctx.bodyJson));
			ctx.resJson = res;
			ctx.resRow = JSON.stringify(res);
			ctx.res = new Response(ctx.resRow);
			await next();
		} catch (e) {
			const err = e as Error;
			const status = (e as { status: number }).status || 500;
			const resText = JSON.stringify({
				message: err.message,
				name: err.name,
				cause: responseStack ? err.cause : void 0,
				stack: responseStack ? err.stack : void 0,
				server: 1,
				status,
			});

			ctx.res = new Response(resText, { status });
			await next();
		}
	};
}
