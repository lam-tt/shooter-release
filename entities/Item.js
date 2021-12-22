"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const schema_1 = require("@colyseus/schema");
const _1 = require(".");
const utils_1 = require("../utils");
class Item extends _1.Entity {
    constructor(id, x, y, r, field, value, target) {
        super(id, x, y, r, 1);
        this.field = field;
        this.value = value;
        this.type = utils_1.Types.Entity.Item;
        this.moveSpeed = 1;
        this.moveAngle = Math.random() * 2 * Math.PI;
        this.following = false;
        this.time = Date.now();
        this.target = target;
    }
    update() {
        this.angle = (this.angle + 1.6) % 360; // rotate speed ~ 5*(dt: 10000/60FPS) 
        if (!this.following && Date.now() - this.time >= 2000) {
            this.following = true;
            this.moveSpeed = 16; // 
        }
        if (this.following) { // update movement direction
            const { x, y } = this.target.position.sub(this.position);
            this.moveAngle = Math.atan2(y, x);
        }
        this.x += Math.cos(this.moveAngle) * this.moveSpeed;
        this.y += Math.sin(this.moveAngle) * this.moveSpeed;
    }
}
__decorate([
    schema_1.type('string')
], Item.prototype, "field", void 0);
exports.Item = Item;
