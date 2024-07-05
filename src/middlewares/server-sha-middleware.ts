import type { ServerMiddleware } from "./middleware-types";

export interface ShaChecker {
	verify: (a: string, b: string) => boolean;
	hash: (a: string) => string;
}

// Middleware to verify vfy header
export const serverShaMiddleware = (
	shaChecker: ShaChecker,
): ServerMiddleware => {
	return async (ctx, next) => {
		const clientVfy = ctx.req.headers.get("AWS-VFY") || ctx.bodyJson["AWS-VFY"];
		if (!clientVfy) {
			ctx.res = new Response("Invalid verification-1", { status: 400 });
			return;
		}
		if (!shaChecker.verify(ctx.bodyRow, clientVfy)) {
			ctx.res = new Response("Invalid verification-1b", { status: 400 });
			return;
		}

		await next();

		const response = ctx.res;
		if (response) {
			response.headers.set("AWS-VFY", shaChecker.hash(ctx.resRow));
		}
	};
};
