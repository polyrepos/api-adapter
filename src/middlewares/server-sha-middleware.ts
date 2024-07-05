import { shaApiSk } from "../../sha-self/sha-api-sk";
import type { ServerMiddleware } from "./middleware-types";

// Middleware to verify vfy header
export const serverShaMiddleware = (): ServerMiddleware => {
	return async (ctx, next) => {
		const clientVfy = ctx.req.headers.get("AWS-VFY") || ctx.bodyJson["AWS-VFY"];
		if (!clientVfy) {
			ctx.res = new Response("Invalid verification-1", { status: 400 });
			return;
		}
		if (!shaApiSk.verify(ctx.bodyRow, clientVfy)) {
			ctx.res = new Response("Invalid verification-1b", { status: 400 });
			return;
		}

		await next();

		const response = ctx.res;
		if (response) {
			response.headers.set("AWS-VFY", shaApiSk.hash(ctx.resRow));
		}
	};
};
