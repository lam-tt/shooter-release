"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const monitor_1 = require("@colyseus/monitor");
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const http_1 = require("http");
const path_1 = require("path");
const ShooterRoom_1 = require("./rooms/ShooterRoom");
const PORT = Number(process.env.PORT || 2567);
const app = express_1.default();
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(compression_1.default());
// Game server
const server = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server: http_1.createServer(app)
    })
});
// Game Rooms
server.define('shooter', ShooterRoom_1.ShooterRoom);
// Serve static resources from the "public" folder
app.use(express_1.default.static(path_1.join(__dirname, 'public')));
// If you don't want people accessing your server stats, comment this line.
app.use('/colyseus', monitor_1.monitor());
// Serve the frontend client
app.get('*', (req, res) => {
    res.send("It's time to kick ass and chew bubblegum!");
});
server.onShutdown(() => {
    console.log(`Shutting down...`);
});
server.listen(PORT);
console.log(`Listening on ws://localhost:${PORT}`);
