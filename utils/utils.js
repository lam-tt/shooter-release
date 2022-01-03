"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulletId = exports.getCollisionInfo = exports.getContactSide = exports.clampf = exports.angleDeg = exports.toFixed = exports.randomId = exports.deg2Rad = exports.randomRarity = exports.randomPosition = exports.randomRange = exports.randomInt = void 0;
const nanoid_1 = require("nanoid");
const _1 = require(".");
function randomInt(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
exports.randomInt = randomInt;
function randomRange(a, b) {
    return Math.random() * (b - a) + a;
}
exports.randomRange = randomRange;
function randomPosition() {
    let range = randomRange(1000, 4500); //spawnRange [min, max]
    let angle = Math.random() * 360;
    let direction = _1.Vec2.RIGHT.rotate(deg2Rad(angle));
    let position = direction.mul(range);
    return position;
}
exports.randomPosition = randomPosition;
function randomRarity() {
    let change = Math.random();
    if (change < 0.03)
        return 3; // 3% SSR
    if (change < 0.11)
        return 2; // 8% SR 
    if (change < 0.33)
        return 1; // 22% R 
    return 0; // 67% N
}
exports.randomRarity = randomRarity;
function deg2Rad(deg) {
    return deg * Math.PI / 180;
}
exports.deg2Rad = deg2Rad;
function randomId() {
    return nanoid_1.nanoid(9);
}
exports.randomId = randomId;
function toFixed(value, n = 1) {
    let num = Math.pow(10, n);
    return Math.round(Math.round(value * (num * 10)) / 10) / num;
}
exports.toFixed = toFixed;
function angleDeg(pos) {
    let rad = Math.atan2(pos.y, pos.x);
    let deg = rad * 180 / Math.PI;
    return (360 + Math.round(deg)) % 360;
}
exports.angleDeg = angleDeg;
function clampf(value, min_inclusive, max_inclusive) {
    if (min_inclusive > max_inclusive) {
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
}
exports.clampf = clampf;
function getContactSide(self, other) {
    let dx = self.x - other.x;
    let dy = self.y - other.y;
    let w = self.radius + other.radius;
    let h = self.radius + other.radius;
    let crossW = w * dy;
    let crossH = h * dx;
    let collision = 'none';
    if (Math.abs(dx) <= w && Math.abs(dy) <= h) {
        if (crossW > crossH) {
            collision = crossW > -crossH ? 'bottom' : 'left';
        }
        else {
            collision = crossW > -crossH ? 'right' : 'top';
        }
    }
    return collision;
}
exports.getContactSide = getContactSide;
function getCollisionInfo(self, other) {
    const dx = other.x - self.x;
    const dy = other.y - self.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    return {
        dx: dx / d,
        dy: dy / d,
        size: (self.radius + other.radius - d) / 2 + 1
    };
}
exports.getCollisionInfo = getCollisionInfo;
const generator = function* () {
    let n = 0;
    while (true)
        yield n++;
};
const gen = generator();
exports.bulletId = () => gen.next().value.toString();
