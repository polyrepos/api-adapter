// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Routers = Record<string, any>;

// 定义中间件类型
export type ServerMiddleware = (
	ctx: ServerMiddlewareContext,
	next: () => Promise<void>,
) => Promise<void>;

export interface ServerMiddlewareContext {
	req: Request;
	path: string;
	res: Response | null;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	bodyJson: any;
	bodyRow: string;
	resRow: string;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	resJson: any;
}

export interface ClientMiddlewareContext {
	req: Request;
	res: Response | null;
	bodyRow: string;
}

export type ClientMiddleware = (
	ctx: ClientMiddlewareContext,
	next: () => Promise<void>,
) => Promise<void>;
