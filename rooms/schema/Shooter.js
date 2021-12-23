"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shooter = void 0;
const schema_1 = require("@colyseus/schema");
const rbush_1 = __importDefault(require("rbush"));
const entities_1 = require("../../entities");
const utils_1 = require("../../utils");
class Shooter extends schema_1.Schema {
    constructor(name, view, onSend) {
        super();
        this.players = new schema_1.ArraySchema();
        this.enemies = new schema_1.MapSchema();
        this.meteors = new schema_1.MapSchema();
        this.bullets = new schema_1.ArraySchema();
        this.items = new schema_1.ArraySchema();
        this.playerActions = [];
        this.view = {};
        this.selectShip = () => {
            this.state = utils_1.Types.GameState.Select;
        };
        // enemy 
        this.addEnemy = () => {
            let pos = utils_1.Utils.randomPosition();
            let enemy = new entities_1.Enemy(utils_1.Utils.randomId(), this.player.x + pos.x, this.player.y + pos.y, utils_1.Constants.ENEMY_SIZE / 2, // enemy.size; 
            utils_1.Utils.randomInt(15, 25) // enemy.baseHp
            );
            enemy.setTarget(this.player);
            this.enemies.set(enemy.id, enemy);
        };
        this.updateEnemy = (id) => {
            const enemy = this.enemies.get(id);
            if (!enemy.isAlive
                || this.playerDistanceTo(enemy) > utils_1.Constants.MAP_RADIUS) {
                this.enemies.delete(id);
                return;
            }
            if (!enemy.active)
                return; // out of camera view -> disable
            enemy.update();
            // if fire
            if (enemy.shouldFire) {
                const bullet = this.getBullet();
                const time = Date.now();
                this.onSend({
                    type: 'fire',
                    time,
                    data: { id }
                });
                enemy.fire(bullet, time);
            }
        };
        //meteor
        this.addMeteor = () => {
            let pos = utils_1.Utils.randomPosition();
            let meteor = new entities_1.Metorite(utils_1.Utils.randomId(), this.player.x + pos.x, this.player.y + pos.y, utils_1.Constants.METEOR_SIZE / 2, // meteor.size; 
            utils_1.Utils.randomInt(8, 15) // meteor.baseHp
            );
            this.meteors.set(meteor.id, meteor);
        };
        this.updateMeteor = (id) => {
            const meteor = this.meteors.get(id);
            if (!meteor.isAlive
                || this.playerDistanceTo(meteor) >= utils_1.Constants.MAP_RADIUS) {
                this.meteors.delete(id);
                return;
            }
            if (!meteor.active)
                return; // out of camera view -> disable
            meteor.update();
        };
        this.roomName = name;
        this.view = view;
        this.onSend = onSend;
        this.state = utils_1.Types.GameState.Intro;
        setTimeout(this.selectShip, 3000);
    }
    get player() { return this.players[0]; }
    updateExplore() {
        // player actions
        this.updatePlayer();
        // enemies
        this.enemies.forEach((enemy, id) => {
            this.updateEnemy(id);
        });
        // meteors
        this.meteors.forEach((meteor, id) => {
            this.updateMeteor(id);
        });
        // bullets
        this.bullets.forEach((bullet, index) => {
            this.updateBullet(index);
        });
        // items
        this.items.forEach(item => {
            item.update();
        });
        this.resolveCollision();
        // spawner
        this.updateSpawner();
    }
    // shooter state
    startExplore() {
        this.state = utils_1.Types.GameState.Explore;
        this.score = 0; // get from backend
        this.level = 1;
    }
    endExplore() {
        // change state
        this.state = utils_1.Types.GameState.End;
        // clear all
        console.log('clear all');
        this.players.splice(0);
        this.bullets.splice(0);
        this.items.splice(0);
        Array.from(this.enemies.keys()).forEach(id => this.enemies.delete(id));
        Array.from(this.meteors.keys()).forEach(id => this.meteors.delete(id));
    }
    update() {
        switch (this.state) {
            case utils_1.Types.GameState.Explore:
                this.updateExplore();
                break;
            default:
                break;
        }
    }
    pushPlayerAction(action) {
        this.playerActions.push(action);
    }
    initPlayer(playerId, data) {
        let { id, element, baseHp, baseFuel } = data;
        this.players.push(new entities_1.Player(playerId, 0, 0, utils_1.Constants.PLAYER_SIZE / 2, id, element, baseHp, baseFuel));
    }
    updatePlayer() {
        //actions
        let action;
        while (this.playerActions.length > 0) {
            action = this.playerActions.shift();
            switch (action.type) {
                case 'move':
                    this.player.move(action.data, utils_1.Constants.PLAYER_SPEED); // player.speed
                    this.player.ack = action.time;
                    break;
                case 'rotate':
                    this.player.rotate(action.data);
                    break;
                case 'fire':
                    const { time, data } = action;
                    if (this.player.canFireAt(time)) {
                        const bullet = this.getBullet();
                        this.player.fire(bullet, time, data.angle);
                    }
                    break;
            }
        }
        this.player.update();
    }
    resolveCollision() {
        // items collision
        this.items.forEach(item => {
            if (this.player.collides(item)) {
                const { field, value } = item;
                this.onSend({
                    type: 'collect-reward',
                    time: Date.now(),
                    data: {
                        field,
                        value
                    }
                });
                this.player.onRewardCollect(field, value);
                // remove item
                let index = this.items.indexOf(item);
                if (index !== -1)
                    this.items.splice(index, 1);
            }
        });
        const rbush = new rbush_1.default().insert({
            minX: this.player.x - this.view.width / 2,
            maxX: this.player.x + this.view.width / 2,
            minY: this.player.y - this.view.height / 2,
            maxY: this.player.y + this.view.height / 2
        });
        const bullets = Array.from(this.bullets.values());
        bullets.forEach(item => {
            if (item.active && !rbush.collides(item.bbox)) {
                item.active = false;
            }
        });
        const entities = [
            ...this.players,
            ...Array.from(this.enemies.values()),
            ...Array.from(this.meteors.values()),
        ];
        entities.forEach(item => item.active = rbush.collides(item.bbox));
        rbush.clear();
        // collision with bullet
        entities.filter(entity => {
            return entity.active && entity.isAlive;
        })
            .forEach(entity => {
            let hits = bullets.filter(bullet => {
                return bullet.active && entity.id !== bullet.id && entity.collides(bullet);
            });
            hits.forEach(bullet => {
                if (!bullet.active)
                    return; // x2 check
                // apply damage
                if (bullet.id === this.player.id) { // shot by player 
                    entity.applyDamage(bullet.power);
                    if (!entity.isAlive) {
                        const reward = entity.getReward();
                        // spawn item
                        for (let field in reward) {
                            if (field === 'score') {
                                this.score += reward.score;
                            }
                            else {
                                const value = reward[field];
                                this.items.push(new entities_1.Item(utils_1.Utils.randomId(), entity.x, entity.y, utils_1.Constants.ITEM_SIZE / 2, field, value, this.player));
                            }
                        }
                    }
                }
                else if (entity.id === this.player.id) { // shot from enemy -> check only if hit player
                    this.player.applyDamage(bullet.power);
                    if (!this.player.isAlive) {
                        this.endExplore();
                    }
                }
                bullet.active = false;
            });
        });
        // correct position
        entities.forEach(entity => {
            if (!entity.isAlive)
                return;
            entities.forEach(hit => {
                if (!hit.isAlive
                    || hit.id === entity.id
                    || !entity.collides(hit))
                    return;
                const { dx, dy, size } = utils_1.Utils.getCollisionInfo(entity, hit);
                hit.x += dx * size;
                hit.y += dy * size;
                entity.x -= dx * size;
                entity.y -= dy * size;
            });
        });
    }
    // bullet
    getBullet() {
        const index = this.bullets.findIndex(bullet => !bullet.active);
        if (index === -1) {
            const bullet = new entities_1.Bullet();
            this.bullets.push(bullet);
            return bullet;
        }
        return this.bullets[index];
    }
    updateBullet(index) {
        const bullet = this.bullets[index];
        if (!bullet || !bullet.active)
            return;
        bullet.move();
    }
    playerDistanceTo(other) {
        return other.position.sub(this.player.position).mag();
    }
    updateSpawner() {
        if (!this.lastSpawned || Date.now() - this.lastSpawned > utils_1.Constants.SPAWN_INTERVAL) { // Delay
            const noEnemy = utils_1.Constants.ENEMY_MAX - this.enemies.size; // enemy.MAX
            for (let i = 0; i < noEnemy; i++) {
                this.addEnemy();
            }
            const noMeteor = utils_1.Constants.METEOR_MAX - this.meteors.size; // meteor.MAX
            for (let i = 0; i < noMeteor; i++) {
                this.addMeteor();
            }
            this.lastSpawned = Date.now();
        }
    }
}
__decorate([
    schema_1.type([entities_1.Player])
], Shooter.prototype, "players", void 0);
__decorate([
    schema_1.type({ map: entities_1.Enemy })
], Shooter.prototype, "enemies", void 0);
__decorate([
    schema_1.type({ map: entities_1.Metorite })
], Shooter.prototype, "meteors", void 0);
__decorate([
    schema_1.type([entities_1.Bullet])
], Shooter.prototype, "bullets", void 0);
__decorate([
    schema_1.type([entities_1.Item])
], Shooter.prototype, "items", void 0);
__decorate([
    schema_1.type('number')
], Shooter.prototype, "state", void 0);
__decorate([
    schema_1.type('number')
], Shooter.prototype, "level", void 0);
__decorate([
    schema_1.type('number')
], Shooter.prototype, "score", void 0);
exports.Shooter = Shooter;
