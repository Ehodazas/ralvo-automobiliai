import type { IncomingMessage, ServerResponse } from 'node:http'

export function handleEnquiry(req: IncomingMessage, res: ServerResponse, opts?: { dev?: boolean }): Promise<void>
