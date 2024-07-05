import type { ServerMiddleware } from "./middleware-types";

export const serverSlowMockMiddleware = (
	reg: RegExp,
	delay: number,
): ServerMiddleware => {
	return async (ctx, next) => {
		if (reg.test(ctx.path)) {
			await new Promise((res) => setTimeout(res, delay));
		}
		await next();
	};
};
