import type { ClientMiddleware } from "./middleware-types";
import type { ShaChecker } from "./server-sha-middleware";

export const clientShaMiddleware = (
	shaChecker: ShaChecker,
): ClientMiddleware => {
	return async (ctx, next) => {
		ctx.req = new Request(ctx.req, {
			headers: {
				...ctx.req.headers,
				"AWS-VFY": shaChecker.hash(ctx.bodyRow),
			},
		});

		await next();

		const response = ctx.res;
		if (response) {
			if (!response.ok) {
				let errMsg = "";
				try {
					const errResponse = await response.json();
					errMsg = errResponse.message;
				} catch (_) {
					errMsg = `HTTP error! status: ${response.status}`;
				}
				throw new Error(errMsg);
			}
			const vfy = response.headers.get("AWS-VFY");
			if (!vfy) {
				throw new Error("No verification-3");
			}

			const text = await response?.clone().text();
			if (!shaChecker.verify(text, vfy)) {
				throw new Error("Verification failed-4");
			}
		}
	};
};
