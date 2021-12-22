"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const schema_1 = require("@colyseus/schema");
const _1 = require(".");
const utils_1 = require("../utils");
class Player extends _1.Entity {
    constructor(id, x, y, r, shipId, element, baseHp, baseFuel) {
        super(id, x, y, r, baseHp);
        this.element = element;
        this.shipId = shipId;
        this.curFuel = this.baseFuel = baseFuel;
        this.fuel = 1;
        this.attack = 1;
        this.lastFired = 0;
        this.type = utils_1.Types.Entity.Player;
        this.buff = {};
    }
    update() {
        // remove timeout buff
        for (let field in this.buff) {
            if (typeof (this.buff[field]) === 'object') {
                const { start, duration } = this.buff[field];
                if (Date.now() - start >= duration * 1000) { // duration in ms
                    delete this.buff[field];
                }
            }
        }
    }
    move(data, speed) {
        var _a, _b;
        let { x, y } = data.dir;
        if (x === 0 && y === 0)
            return;
        let bonus = (_b = (_a = this.buff.speed) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : 1;
        let mag = Math.sqrt(x * x + y * y);
        let dx = Math.round(x * speed * bonus / mag);
        let dy = Math.round(y * speed * bonus / mag);
        this.x += dx;
        this.y += dy;
    }
    rotate(data) {
        this.angle = data.angle;
    }
    fire(bullet, firedAt, angle) {
        var _a, _b;
        for (let side = utils_1.Types.GunSide.Left; side < utils_1.Types.GunSide.Count; side++) {
            let i = side == utils_1.Types.GunSide.Left ? -1 : 1;
            const v2 = new utils_1.Vec2(i * 29, 90); // [29, 90] fire spot offset from client
            const size = v2.mag();
            const rad = utils_1.Utils.deg2Rad(angle) + Math.atan2(v2.x, v2.y);
            const { power, rate } = this.buff;
            this.lastFired = firedAt;
            bullet.onActive({
                owner: this.id,
                x: this.x + Math.cos(rad) * size,
                y: this.y + Math.sin(rad) * size,
                radius: utils_1.Constants.BULLET_SIZE / 2,
                power: this.attack * ((_a = power === null || power === void 0 ? void 0 : power.value) !== null && _a !== void 0 ? _a : 1),
                speed: utils_1.Constants.BULLET_SPEED * ((_b = rate === null || rate === void 0 ? void 0 : rate.value) !== null && _b !== void 0 ? _b : 1),
                element: this.element,
                angle,
                firedAt,
                side
            });
        }
    }
    onRewardCollect(field, value) {
        if (field === 'fuel') {
            this.curFuel = Math.min(this.curFuel + value, this.baseFuel);
            let percent = this.curFuel / this.baseFuel;
            this.fuel = utils_1.Utils.toFixed(percent, 2);
        }
        else if (field === 'health') {
            this.curHp = Math.min(this.curHp + value, this.baseHp);
            let percent = this.curHp / this.baseHp;
            this.health = utils_1.Utils.toFixed(percent, 2);
        }
        else {
            value = Object.assign({ start: Date.now() }, value);
            this.buff[field] = value;
        }
    }
    canFireAt(time) {
        return (time - this.lastFired > utils_1.Constants.PLAYER_ATK_RATE);
    }
}
__decorate([
    schema_1.type('number')
], Player.prototype, "shipId", void 0);
__decorate([
    schema_1.type('number')
], Player.prototype, "fuel", void 0);
__decorate([
    schema_1.type('number')
], Player.prototype, "ack", void 0);
exports.Player = Player;