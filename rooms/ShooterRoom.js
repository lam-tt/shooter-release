"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShooterRoom = void 0;
const colyseus_1 = require("colyseus");
const Shooter_1 = require("./schema/Shooter");
class ShooterRoom extends colyseus_1.Room {
    onCreate(options) {
        var _a;
        this.maxClients = (_a = options.roomMaxPlayer) !== null && _a !== void 0 ? _a : 1;
        const { roomName, view } = options;
        this.setState(new Shooter_1.Shooter(roomName, view, msg => {
            this.broadcast(msg.type, msg);
        }));
        this.setMetadata({
            roomName,
            roomMaxPlayer: this.maxClients
        });
        this.setPatchRate(25);
        this.setSimulationInterval(() => {
            this.onUpdate();
        });
        this.onMessage("*", (client, type, message) => {
            const playerId = client.sessionId;
            switch (type) {
                // shooter state
                case 'ship-status':
                    {
                        this.status = message.data;
                    }
                    break;
                case 'query-ships':
                    {
                        const status = this.status; // available ship_id from backend
                        client.send(type, {
                            type,
                            time: Date.now(),
                            data: status
                        });
                    }
                    break;
                case 'ship-selected':
                    {
                        this.state.initPlayer(playerId, message.data);
                        this.state.startExplore();
                    }
                    break;
                case 'game-pause':
                    {
                        console.log('game-paused -> TBU');
                    }
                    break;
                case 'game-end':
                    {
                        console.log('game-end');
                        this.state.endExplore();
                    }
                    break;
                case 'game-restart':
                    {
                        console.log('game-restart');
                        this.state.selectShip();
                    }
                    break;
                // player action
                case 'move':
                case 'fire':
                case 'rotate':
                    {
                        this.state.pushPlayerAction(Object.assign({ playerId }, message));
                    }
                    break;
            }
        });
    }
    onJoin(client, options) {
        console.log(client.sessionId, "joined!");
    }
    onLeave(client, consented) {
        console.log(client.sessionId, "left!");
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
    }
    onUpdate() {
        this.state.update();
    }
}
exports.ShooterRoom = ShooterRoom;
