import { shaApiSk } from "../../sha-self/sha-api-sk";
import type { ClientMiddleware } from "./middleware-types";

export const clientShaMiddleware: ClientMiddleware = async (ctx, next) => {
	ctx.req = new Request(ctx.req, {
		headers: {
			...ctx.req.headers,
			"AWS-VFY": shaApiSk.hash(ctx.bodyRow),
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
		if (!shaApiSk.verify(text, vfy)) {
			throw new Error("Verification failed-4");
		}
	}
};
