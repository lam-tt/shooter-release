"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bullet = void 0;
const schema_1 = require("@colyseus/schema");
const _1 = require(".");
const utils_1 = require("../utils");
class Bullet extends _1.Entity {
    constructor() {
        super();
        this.type = utils_1.Types.Entity.Bullet;
    }
    move() {
        let rad = utils_1.Utils.deg2Rad(this.angle);
        this.x += Math.cos(rad) * this.speed;
        this.y += Math.sin(rad) * this.speed;
    }
    onActive(data) {
        var _a;
        this.active = true;
        this.id = data.owner;
        this.x = data.x;
        this.y = data.y;
        this.radius = data.radius;
        this.angle = data.angle;
        this.firedAt = data.firedAt;
        this.power = data.power;
        this.element = data.element;
        this.side = data.side;
        this.speed = (_a = data.speed) !== null && _a !== void 0 ? _a : utils_1.Constants.BULLET_SPEED;
    }
}
__decorate([
    schema_1.type('number')
], Bullet.prototype, "firedAt", void 0);
__decorate([
    schema_1.type('number')
], Bullet.prototype, "side", void 0);
exports.Bullet = Bullet;
