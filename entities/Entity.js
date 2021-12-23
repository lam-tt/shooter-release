"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const schema_1 = require("@colyseus/schema");
const utils_1 = require("../utils");
class Entity extends schema_1.Schema {
    constructor(id = '', x = 0, y = 0, r = 0, baseHp = 0) {
        super();
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = r;
        this.angle = 0;
        this.curHp = this.baseHp = baseHp;
        this.health = 1;
        this.element = utils_1.Utils.randomInt(0, 4);
        this.active = true;
    }
    get name() { return utils_1.Types.Entity[this.type]; }
    ;
    applyDamage(damage) {
        this.curHp -= damage;
        let percent = this.curHp / this.baseHp;
        this.health = utils_1.Utils.toFixed(percent, 2);
    }
    getReward() { }
    get isAlive() {
        return this.curHp > 0;
    }
    get position() {
        return new utils_1.Vec2(this.x, this.y);
    }
    get bbox() {
        return {
            minX: this.x - this.radius,
            maxX: this.x + this.radius,
            minY: this.y - this.radius,
            maxY: this.y + this.radius
        };
    }
    collides(other) {
        if (!this.active || !other.active)
            return false;
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist <= this.radius + other.radius;
    }
}
__decorate([
    schema_1.type('string')
], Entity.prototype, "id", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "x", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "y", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "radius", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "angle", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "health", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "element", void 0);
__decorate([
    schema_1.type('number')
], Entity.prototype, "type", void 0);
__decorate([
    schema_1.type('boolean')
], Entity.prototype, "active", void 0);
exports.Entity = Entity;
