"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec2 = void 0;
const utils_1 = require("./utils");
class Vec2 {
    constructor(x, y) {
        this.x = x !== null && x !== void 0 ? x : 0;
        this.y = y !== null && y !== void 0 ? y : 0;
    }
    static from(v2) {
        return new Vec2(v2.x, v2.y);
    }
    static fromAngle(deg) {
        const rad = deg * Math.PI / 180;
        return new Vec2(Math.cos(rad), Math.sin(rad));
    }
    static random() {
        const r = Math.random() * 2.0 * Math.PI;
        const out = new Vec2();
        out.x = Math.cos(r);
        out.y = Math.sin(r);
        return out;
    }
    normalize() {
        var magSqr = this.x * this.x + this.y * this.y;
        if (magSqr === 1.0)
            return this;
        if (magSqr === 0.0) {
            return this;
        }
        var out = Vec2.from(this);
        var invsqrt = 1.0 / Math.sqrt(magSqr);
        out.x *= invsqrt;
        out.y *= invsqrt;
        return out;
    }
    magSqr() {
        return this.x * this.x + this.y * this.y;
    }
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    dot(v2) {
        return this.x * v2.x + this.y * v2.y;
    }
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }
    angle(vector) {
        var magSqr1 = this.magSqr();
        var magSqr2 = vector.magSqr();
        if (magSqr1 === 0 || magSqr2 === 0) {
            console.warn("Can't get angle between zero vector");
            return 0.0;
        }
        var dot = this.dot(vector);
        var theta = dot / (Math.sqrt(magSqr1 * magSqr2));
        theta = utils_1.clampf(theta, -1.0, 1.0);
        return Math.acos(theta);
    }
    signAngle(vector) {
        let angle = this.angle(vector);
        return this.cross(vector) < 0 ? -angle : angle;
    }
    rotate(radians) {
        var out = Vec2.from(this);
        var sin = Math.sin(radians);
        var cos = Math.cos(radians);
        out.x = cos * this.x - sin * this.y;
        out.y = sin * this.x + cos * this.y;
        return out;
    }
    mul(num) {
        var out = Vec2.from(this);
        out.x *= num;
        out.y *= num;
        return out;
    }
    sub(v2) {
        var out = Vec2.from(this);
        out.x -= v2.x;
        out.y -= v2.y;
        return out;
    }
    add(v2) {
        var out = Vec2.from(this);
        out.x += v2.x;
        out.y += v2.y;
        return out;
    }
}
exports.Vec2 = Vec2;
Vec2.ZERO = new Vec2();
Vec2.UP = new Vec2(0, 1);
Vec2.RIGHT = new Vec2(1, 0);
