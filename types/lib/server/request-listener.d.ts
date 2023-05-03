/// <reference types="node" resolution-mode="require"/>
export function requestListener(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}): void;
export namespace esma {
    type Request = import('../types.js').esma.Request;
    type Response = import('../types.js').esma.Response;
    type Context = import('../types.js').esma.Context;
}
import * as http from 'node:http';
