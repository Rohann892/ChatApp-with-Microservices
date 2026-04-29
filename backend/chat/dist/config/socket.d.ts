import { Server } from "socket.io";
declare const app: import("express-serve-static-core").Express;
declare const server: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getReceiverSocketMap: (recieverId: string) => string | undefined;
export { app, server, io };
//# sourceMappingURL=socket.d.ts.map