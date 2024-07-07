import { composeMiddlewares } from "./compose-middlewares";
import type {
	ServerMiddleware,
	ServerMiddlewareContext,
} from "./middlewares/middleware-types";

export type Router = (req: Request) => Promise<Response | null>;

export function bunServerAdapter(...middlewares: (ServerMiddleware | null)[]) {
	const composed = composeMiddlewares<ServerMiddleware>(
		middlewares.filter(Boolean) as ServerMiddleware[],
	);
	return async (req: Request) => {
		const path = new URL(req.url).pathname;
		const bodyRow = await req.text();
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		let bodyJson: any;
		try {
			bodyJson = JSON.parse(bodyRow);
		} catch (_e) {
			bodyJson = {};
		}
		const ctx: ServerMiddlewareContext = {
			path,
			req,
			bodyRow,
			bodyJson,
			res: null,
			resRow: "",
			resJson: null,
		};
		await composed(ctx, async () => {});
		return ctx.res;
	};
}
