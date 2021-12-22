"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metorite = void 0;
const _1 = require(".");
const utils_1 = require("../utils");
class Metorite extends _1.Entity {
    constructor(id, x, y, r, baseHp) {
        super(id, x, y, r, baseHp);
        this.type = utils_1.Types.Entity.Meteor;
        this.moveSpeed = utils_1.Utils.randomRange(0.5, 0.9);
        this.moveAngle = Math.random() * 2 * Math.PI;
        this.rotSpeed = utils_1.Utils.randomInt(40, 80);
    }
    update() {
        if (this.rotSpeed > 0) {
            this.angle = Math.round((this.angle + utils_1.Utils.toFixed(this.rotSpeed * 0.017, 1))) % 360; // dt / 1000
            this.rotSpeed -= 0.01;
        }
        if (this.moveSpeed > 0) {
            this.x += Math.cos(this.moveAngle) * this.moveSpeed;
            this.y += Math.sin(this.moveAngle) * this.moveSpeed;
        }
    }
    getReward() {
        let reward = {
            fuel: 0.03,
            score: 1
        };
        switch (this.element) {
            case 0:
                reward.power = { value: 2, duration: 10 };
                break;
            case 1:
                reward.speed = { value: 1.5, duration: 10 };
                break;
            case 2:
                reward.rate = { value: 2, duration: 10 };
                break;
            case 3:
                reward.health = 3;
                break;
        }
        return reward;
    }
}
exports.Metorite = Metorite;
