"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulletType = exports.PlayerState = exports.GameState = exports.Entity = void 0;
var Entity;
(function (Entity) {
    Entity[Entity["Meteor"] = 0] = "Meteor";
    Entity[Entity["Enemy"] = 1] = "Enemy";
    Entity[Entity["Boss"] = 2] = "Boss";
    Entity[Entity["Player"] = 3] = "Player";
    Entity[Entity["Bullet"] = 4] = "Bullet";
    Entity[Entity["Item"] = 5] = "Item";
})(Entity = exports.Entity || (exports.Entity = {}));
var GameState;
(function (GameState) {
    GameState[GameState["Intro"] = 0] = "Intro";
    GameState[GameState["Select"] = 1] = "Select";
    GameState[GameState["Explore"] = 2] = "Explore";
    GameState[GameState["Boss"] = 3] = "Boss";
    GameState[GameState["End"] = 4] = "End";
})(GameState = exports.GameState || (exports.GameState = {}));
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Prepare"] = 0] = "Prepare";
    PlayerState[PlayerState["Ready"] = 1] = "Ready";
    PlayerState[PlayerState["Wait"] = 2] = "Wait";
    PlayerState[PlayerState["Death"] = 3] = "Death";
})(PlayerState = exports.PlayerState || (exports.PlayerState = {}));
var BulletType;
(function (BulletType) {
    BulletType[BulletType["DoT"] = 0] = "DoT";
    BulletType[BulletType["Split"] = 1] = "Split";
    BulletType[BulletType["Chase"] = 2] = "Chase";
    BulletType[BulletType["Explode"] = 3] = "Explode";
    BulletType[BulletType["Normal"] = 4] = "Normal";
})(BulletType = exports.BulletType || (exports.BulletType = {}));
