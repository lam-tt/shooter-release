"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
const schema_1 = require("@colyseus/schema");
class View extends schema_1.Schema {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }
    update() {
        if (!this.target)
            return;
        if (this.isFollow) {
            this.x = this.target.x;
            this.y = this.target.y;
        }
    }
    setData(follow, x, y) {
        this.isFollow = follow;
        this.x = x !== null && x !== void 0 ? x : 0;
        this.y = y !== null && y !== void 0 ? y : 0;
    }
    get bbox() {
        return {
            minX: this.x - this.width / 2,
            maxX: this.x + this.width / 2,
            minY: this.y - this.height / 2,
            maxY: this.y + this.height / 2
        };
    }
    contains(entity) {
        if (entity.bbox.maxX < this.bbox.minX || entity.bbox.minX > this.bbox.maxX
            || entity.bbox.maxY < this.bbox.minY || entity.bbox.minY > this.bbox.maxY)
            return false;
        return true;
    }
}
exports.View = View;
