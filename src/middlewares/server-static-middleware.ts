import * as fs from "node:fs/promises";
import type { ServerMiddleware } from "./middleware-types";

// 获取文件的内容类型
function getContentType(filePath: string) {
	const ext = filePath.split(".").pop();
	switch (ext) {
		case "html":
			return "text/html";
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
		case "json":
			return "application/json";
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "gif":
			return "image/gif";
		case "svg":
			return "image/svg+xml";
		case "atlas":
			return "text/plain";
		case "skel":
			return "text/plain";
		default:
			return "application/octet-stream";
	}
}

export const serverStaticMiddleware = (BASE_PATH: string): ServerMiddleware => {
	return async (ctx, next) => {
		if (ctx.res) {
			await next();
			return;
		}
		try {
			const path = ctx.path;
			const filePath = BASE_PATH + (path === "/" ? "/index.html" : path);
			const stat = await fs.stat(filePath);
			if (stat.isFile()) {
				const file = Bun.file(filePath);
				ctx.res = new Response(file, {
					headers: {
						"Content-Type": getContentType(filePath),
					},
				});
			}
			ctx.res = new Response("Path is not file", {
				status: 404,
				statusText: "Not Found",
			});
			await next();
		} catch (e) {
			const err = e as Error;
			ctx.res = new Response(`File not found, ${err.message}`, {
				status: 404,
				statusText: "Not Found",
			});
			await next();
		}
	};
};
