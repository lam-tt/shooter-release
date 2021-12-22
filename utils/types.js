"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GunSide = exports.PlayerState = exports.GameState = exports.Entity = void 0;
var Entity;
(function (Entity) {
    Entity[Entity["Enemy"] = 0] = "Enemy";
    Entity[Entity["Meteor"] = 1] = "Meteor";
    Entity[Entity["Bullet"] = 2] = "Bullet";
    Entity[Entity["Player"] = 3] = "Player";
    Entity[Entity["Item"] = 4] = "Item";
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
    PlayerState[PlayerState["Death"] = 2] = "Death";
})(PlayerState = exports.PlayerState || (exports.PlayerState = {}));
var GunSide;
(function (GunSide) {
    GunSide[GunSide["Left"] = 0] = "Left";
    GunSide[GunSide["Right"] = 1] = "Right";
    GunSide[GunSide["Count"] = 2] = "Count";
})(GunSide = exports.GunSide || (exports.GunSide = {}));
