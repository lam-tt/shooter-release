"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enemy = void 0;
const schema_1 = require("@colyseus/schema");
const _1 = require(".");
const utils_1 = require("../utils");
class Enemy extends _1.Entity {
    constructor(id, x, y, r, baseHp) {
        super(id, x, y, r, baseHp);
        this.state = 'idle';
        this.stateDur = 0;
        this.lastAct = 0;
        this.target = null;
        this.rarity = utils_1.Utils.randomRarity();
        this.attack = utils_1.Utils.randomRange(1, 1.5);
        this.type = utils_1.Types.Entity.Enemy;
    }
    setTarget(target) {
        this.target = target;
    }
    // state idle
    startIdle() {
        this.state = 'idle';
        this.lastAct = Date.now();
        this.stateDur = utils_1.Utils.randomInt(500, 1000); // ms
    }
    updateIdle() {
        if (this.canAttack) {
            this.startAttack();
            return;
        }
        if (Date.now() - this.lastAct > this.stateDur) {
            this.startPatrol();
        }
    }
    // state patrol
    startPatrol() {
        this.state = 'patrol';
        this.lastAct = Date.now();
        this.stateDur = utils_1.Utils.randomRange(3500, 6500); // ms
        const angle = this.angle + (Math.random() * 60 - 30);
        this.moveDir = utils_1.Vec2.fromAngle(angle);
    }
    updatePatrol() {
        if (this.canAttack) {
            this.startAttack();
            return;
        }
        if (Date.now() - this.lastAct > this.stateDur) {
            this.startIdle();
            return;
        }
        if (this.targetDir.mag() > utils_1.Constants.MAP_RADIUS) { // travel too far -> move back to player
            this.moveDir = utils_1.Vec2.from(this.targetDir).normalize();
        }
        else if (Math.random() < 0.08) { // 8% change direction of movement
            const angle = this.angle + (Math.random() * 60 - 30);
            this.moveDir = utils_1.Vec2.fromAngle(angle);
        }
        this.rotateTo(this.moveDir);
        this.move(this.angle); // enemy.speed
    }
    // state attack
    startAttack() {
        this.state = 'attack';
        this.lastAct = Date.now();
    }
    updateAttack() {
        if (!this.targetInSight) {
            this.startPatrol();
            return;
        }
        this.rotateTo(this.targetDir);
    }
    move(angle) {
        let rad = utils_1.Utils.deg2Rad(angle);
        this.x += Math.cos(rad) * utils_1.Constants.ENEMY_SPEED;
        this.y += Math.sin(rad) * utils_1.Constants.ENEMY_SPEED;
    }
    fire(bullet, time) {
        this.lastAct = time;
        for (let side = utils_1.Types.GunSide.Left; side < utils_1.Types.GunSide.Count; side++) {
            let i = side == utils_1.Types.GunSide.Left ? -1 : 1;
            const v2 = new utils_1.Vec2(29 * i, 90); // [29, 90] fire spot offset from client
            const size = v2.mag();
            const rad = utils_1.Utils.deg2Rad(this.angle) + Math.atan2(v2.x, v2.y);
            bullet.onActive({
                owner: this.id,
                x: this.x + Math.cos(rad) * size,
                y: this.y + Math.sin(rad) * size,
                radius: utils_1.Constants.BULLET_SIZE / 2,
                power: this.attack,
                element: this.element,
                angle: this.angle,
                firedAt: this.lastAct,
                side
            });
        }
    }
    rotateTo(dir) {
        let speed = 3; // = dt * 180
        let from = utils_1.Vec2.fromAngle(this.angle);
        let diff = Math.round(from.signAngle(dir) * 180 / Math.PI);
        if (Math.abs(diff) <= speed) {
            this.angle = utils_1.Utils.angleDeg(dir);
        }
        else {
            this.angle += (diff / Math.abs(diff)) * speed;
        }
    }
    update() {
        switch (this.state) {
            case 'idle':
                this.updateIdle();
                break;
            case 'patrol':
                this.updatePatrol();
                break;
            case 'attack':
                this.updateAttack();
                break;
        }
    }
    getReward() {
        let reward = {};
        let item = {
            health: 3,
            power: { value: 2, duration: 15 },
            speed: { value: 1.5, duration: 15 },
            rate: { value: 2, duration: 15 }
        };
        let key = Object.keys(item)[utils_1.Utils.randomInt(0, 4)];
        reward[key] = item[key];
        switch (this.rarity) {
            case 0:
                reward.score = 3;
                break;
            case 1:
                reward.fuel = 0.03;
                reward.score = 5;
                break;
            case 2:
                reward.fuel = 0.03;
                reward.score = 10;
                break;
            case 3:
                reward.fuel = 0.03;
                reward.score = 20;
                break;
        }
        return reward;
    }
    get isAlive() {
        return this.curHp > 0;
    }
    get targetDir() {
        return this.target.position.sub(this.position);
    }
    get targetInSight() {
        return this.targetDir.mag() <= utils_1.Constants.ENEMY_CHASE_RANGE; // enemy.chaseRange
    }
    get canAttack() {
        return this.targetDir.mag() <= utils_1.Constants.ENEMY_ATTACK_RANGE; // enemy.atkRange
    }
    get shouldFire() {
        return this.state === 'attack'
            && Date.now() - this.lastAct > utils_1.Constants.ENEMY_ATK_RATE;
    }
}
__decorate([
    schema_1.type('number')
], Enemy.prototype, "rarity", void 0);
exports.Enemy = Enemy;
