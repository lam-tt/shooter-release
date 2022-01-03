"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Boss = void 0;
const schema_1 = require("@colyseus/schema");
const _1 = require(".");
const utils_1 = require("../utils");
class Boss extends _1.Entity {
    constructor() {
        super(utils_1.Utils.randomId());
        this.setData = (spot) => {
            this.gunSpot = Array.from(spot).map((item) => new utils_1.Vec2(item.x, item.y));
        };
        this.type = utils_1.Types.Entity.Boss;
        this.radius = utils_1.Constants.BOSS_SIZE / 2;
    }
    onActive() {
        this.active = true;
        this.x = this.target.x;
        this.y = this.target.y + utils_1.Constants.BOSS_OFFSET_Y;
        this.curHp = this.baseHp = utils_1.Utils.randomInt(75, 125);
        this.rarity = utils_1.Utils.randomRarity();
        this.attack = utils_1.Utils.randomRange(5, 7.5);
        this.angle = 270;
    }
    setTarget(target) {
        this.target = target;
    }
    move() {
        let dx = this.target.x - this.x;
        if (dx !== 0) {
            this.x += dx / Math.abs(dx) * utils_1.Constants.ENEMY_SPEED;
        }
    }
    fire(bullet, time) {
        var _a;
        this.lastFire = time;
        (_a = this.gunSpot) === null || _a === void 0 ? void 0 : _a.forEach((spot, side) => {
            const offset = spot.rotate(utils_1.Utils.deg2Rad(this.angle - 90));
            bullet[side].onActive({
                owner: this.id,
                x: this.x + offset.x,
                y: this.y + offset.y,
                radius: utils_1.Constants.BULLET_SIZE,
                power: this.attack,
                element: this.element,
                angle: this.angle,
                firedAt: this.lastFire,
                speed: utils_1.Constants.BULLET_BOSS_SPEED,
                side
            });
        });
    }
    rotate() {
        let speed = 3; // = dt * 180
        let from = utils_1.Vec2.fromAngle(this.angle);
        let diff = Math.round(from.signAngle(this.targetDir) * 180 / Math.PI);
        if (Math.abs(diff) <= speed) {
            this.angle = utils_1.Utils.angleDeg(this.targetDir);
        }
        else {
            this.angle += diff / Math.abs(diff) * speed;
        }
    }
    update() {
        this.move();
        this.rotate();
    }
    get targetDir() {
        return this.target.position.sub(this.position);
    }
    get shouldFire() {
        return !this.lastFire || Date.now() - this.lastFire > utils_1.Constants.BOSS_ATK_RATE;
    }
}
__decorate([
    schema_1.type('number')
], Boss.prototype, "rarity", void 0);
exports.Boss = Boss;
