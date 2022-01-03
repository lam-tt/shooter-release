"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Shooter = void 0;
const schema_1 = require("@colyseus/schema");
const entities_1 = require("../../entities");
const Boss_1 = require("../../entities/Boss");
const View_1 = require("../../entities/View");
const utils_1 = require("../../utils");
class Shooter extends schema_1.Schema {
    constructor(name, view, onSend) {
        super();
        this.players = new schema_1.ArraySchema();
        this.bosses = new schema_1.ArraySchema();
        this.enemies = new schema_1.MapSchema();
        this.meteors = new schema_1.MapSchema();
        this.bullets = new schema_1.ArraySchema();
        this.items = new schema_1.ArraySchema();
        this.playerActions = [];
        this.onGamePause = (data) => {
            this.ready = !data.pause;
            this.player.state = data.pause ? utils_1.Types.PlayerState.Wait : utils_1.Types.PlayerState.Ready;
        };
        //select state
        this.startStateSelect = () => {
            this.state = utils_1.Types.GameState.Select;
        };
        // explore state
        this.startStateExplore = () => {
            this.ready = false;
            this.curScore = 0;
            this.spawner = setInterval(this.spawnEntity, utils_1.Constants.SPAWN_INTERVAL);
            this.state = utils_1.Types.GameState.Explore;
            this.player.state = utils_1.Types.PlayerState.Prepare;
        };
        this.onStateExplore = () => {
            this.updateVisible(this.bullets, ...Array.from(this.enemies.values()), ...Array.from(this.meteors.values()));
            this.updateEnemies();
            this.updateMeteors();
            this.updateBullets();
        };
        this.endStateExplore = () => {
            clearInterval(this.spawner);
            // disable entities
            const entitis = [
                ...this.bullets,
                ...Array.from(this.enemies.values()),
                ...Array.from(this.meteors.values())
            ];
            entitis.forEach(item => item.setActive(false));
            this.player.state = utils_1.Types.PlayerState.Wait;
        };
        // state end
        this.startStateEnd = () => {
            clearInterval(this.spawner);
            // clear all entity
            this.players.splice(0);
            this.bullets.splice(0);
            this.items.splice(0);
            Array.from(this.enemies.keys()).forEach(id => this.enemies.delete(id));
            Array.from(this.meteors.keys()).forEach(id => this.meteors.delete(id));
            this.state = utils_1.Types.GameState.End;
        };
        // boss state
        this.startStateBoss = () => {
            if (!this.boss) {
                const boss = new Boss_1.Boss();
                boss.setTarget(this.player);
                this.bosses.push(boss);
            }
            this.ready = false;
            this.boss.onActive();
            this.state = utils_1.Types.GameState.Boss;
            this.player.state = utils_1.Types.PlayerState.Prepare;
        };
        this.onStateBoss = () => {
            this.updateVisible(this.bullets);
            this.updateBoss();
            this.updateBullets();
        };
        this.endStateBoss = () => {
            // deactive entity 
            const entitis = [
                ...this.bullets,
                ...this.bosses
            ];
            entitis.forEach(item => item.setActive(false));
            this.player.state = utils_1.Types.PlayerState.Wait;
        };
        this.updateView = () => {
            this.view.update();
        };
        this.updateState = () => {
            if (!this.ready)
                return;
            switch (this.state) {
                case utils_1.Types.GameState.Explore:
                    {
                        this.onStateExplore();
                    }
                    break;
                case utils_1.Types.GameState.Boss:
                    {
                        this.onStateBoss();
                    }
                    break;
            }
        };
        this.updateBoss = () => {
            if (!this.boss
                || !this.boss.active)
                return;
            if (!this.boss.isAlive) {
                this.boss.setActive(false);
                return;
            }
            this.boss.update();
            if (this.boss.shouldFire) {
                const bullets = this.getBullets(4);
                const time = Date.now();
                this.onSend({
                    type: 'fire',
                    time,
                    data: {
                        boss: true,
                        id: this.boss.id
                    }
                });
                this.boss.fire(bullets, time);
            }
        };
        this.updateEnemies = () => {
            this.enemies.forEach((enemy, id) => this.updateEnemy(id));
        };
        this.updateMeteors = () => {
            this.meteors.forEach((meteor, id) => this.updateMeteor(id));
        };
        this.updateBullets = () => {
            this.bullets.forEach((bullet, index) => this.updateBullet(index));
        };
        this.collectItem = () => {
            this.items.forEach(item => {
                if (this.player.collides(item)) {
                    const { field, value } = item;
                    this.player.onRewardCollect(field, value);
                    this.onSend({
                        type: 'collect-reward',
                        time: Date.now(),
                        data: {
                            field,
                            value
                        }
                    });
                    let index = this.items.indexOf(item);
                    index === -1 || this.items.splice(index, 1);
                    return;
                }
                item.update();
            });
        };
        this.updateVisible = (bullets, ...entities) => {
            // bullet only reactive when shooting
            bullets.forEach(item => {
                if (item.active && !this.view.contains(item)) {
                    item.setActive(false);
                }
            });
            // entity active/reactive if in/out of view  
            entities.forEach(item => item.active = this.view.contains(item));
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
                const bullets = this.getBullets(2);
                const time = Date.now();
                this.onSend({
                    type: 'fire',
                    time,
                    data: {
                        id
                    }
                });
                enemy.fire(bullets, time);
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
        this.spawnEntity = () => {
            const noEnemy = utils_1.Constants.ENEMY_MAX - this.enemies.size;
            for (let i = 0; i < noEnemy; i++) {
                this.addEnemy();
            }
            const noMeteor = utils_1.Constants.METEOR_MAX - this.meteors.size;
            for (let i = 0; i < noMeteor; i++) {
                this.addMeteor();
            }
        };
        this.roomName = name;
        this.view = new View_1.View(view.width, view.height);
        this.onSend = onSend;
        this.state = utils_1.Types.GameState.Intro;
        this.score = 0; // get from backend
        this.level = 1;
        setTimeout(this.startStateSelect, 3000);
    }
    get player() { return this.players[0]; }
    get boss() { return this.bosses[0]; }
    setData(data) {
        var _a;
        const { id, spot } = data;
        const entiy = id === this.player.id ? this.player
            : id === ((_a = this.boss) === null || _a === void 0 ? void 0 : _a.id) ? this.boss
                : this.enemies.get(id);
        entiy === null || entiy === void 0 ? void 0 : entiy.setData(spot);
    }
    onGameReady() {
        this.ready = true;
        this.view.setData(this.state === utils_1.Types.GameState.Explore, this.player.x, this.player.y + 410);
        this.player.state = utils_1.Types.PlayerState.Ready;
    }
    update() {
        this.updateView();
        this.updatePlayer();
        this.collectItem();
        this.updateState();
        this.resolveCollision();
    }
    pushPlayerAction(action) {
        this.playerActions.push(action);
    }
    initPlayer(playerId, data) {
        if (!this.player) {
            let { id, element, baseHp, baseFuel } = data;
            this.players.push(new entities_1.Player(playerId, 0, 0, utils_1.Constants.PLAYER_SIZE / 2, id, element, baseHp, baseFuel));
        }
        this.view.target = this.player;
        this.startStateExplore();
    }
    updatePlayer() {
        if (!this.player)
            return;
        this.player.update();
        let action;
        while (this.playerActions.length > 0) {
            action = this.playerActions.shift();
            switch (action.type) {
                case 'move':
                    {
                        const { moveDir, angle } = action.data;
                        if (moveDir) {
                            this.player.move(moveDir, utils_1.Constants.PLAYER_SPEED); // player.speed
                            this.player.ack = action.time;
                        }
                        if (angle) {
                            this.player.rotate(angle);
                        }
                    }
                    break;
                case 'rotate':
                    {
                        this.player.rotate(action.data);
                    }
                    break;
                case 'fire':
                    {
                        const { time, data } = action;
                        if (this.player.canFireAt(time)) {
                            const bullet = this.getBullets(2);
                            this.player.fire(bullet, time, data.angle);
                        }
                    }
                    break;
            }
        }
        this.player.clampPos(this.view);
    }
    resolveCollision() {
        // bullet - bullet
        this.bullets.forEach(bullet => {
            if (!bullet.active)
                return;
            const hits = this.bullets.filter(item => item.active &&
                item.id != bullet.id &&
                item.owner != bullet.owner &&
                item.collides(bullet));
            let collided = false;
            hits.forEach(hit => {
                hit.active = false;
                collided = true;
            });
            bullet.active = !collided;
        });
        // bullet - entity
        const entities = ([
            ...this.players,
            ...this.bosses,
            ...Array.from(this.enemies.values()),
            ...Array.from(this.meteors.values()),
        ])
            .filter(entity => entity.active && entity.isAlive);
        entities.forEach(entity => {
            const hits = this.bullets.filter(bullet => bullet.active &&
                entity.id !== bullet.owner &&
                entity.collides(bullet));
            hits.forEach(bullet => {
                if (!bullet.active || !entity.isAlive)
                    return; // x2 check
                // apply damage
                if (bullet.owner === this.player.id) { // shot by player 
                    entity.applyDamage(bullet.power);
                    if (!entity.isAlive) {
                        const reward = entity.getReward();
                        // spawn item
                        for (let field in reward) {
                            const value = reward[field];
                            if (field === 'score') {
                                this.score += value;
                                this.curScore += value;
                            }
                            else {
                                this.items.push(new entities_1.Item(utils_1.Utils.randomId(), entity.x, entity.y, utils_1.Constants.ITEM_SIZE / 2, field, value, this.player));
                            }
                        }
                        // update state
                        if (entity.type == utils_1.Types.Entity.Boss) {
                            this.level += 1;
                            this.endStateBoss();
                            setTimeout(this.startStateExplore, 1000);
                        }
                        else if (Math.floor(this.score / utils_1.Constants.SPAWN_BOSS_STEP) >= this.level) {
                            this.endStateExplore();
                            this.startStateBoss();
                        }
                    }
                }
                else if (entity.id === this.player.id) { // shot from enemy -> check only if hit player
                    //this.player.applyDamage(bullet.power);
                    if (!this.player.isAlive) {
                        this.player.state = utils_1.Types.PlayerState.Death;
                        this.startStateEnd();
                    }
                }
                bullet.setActive(false);
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
    getBullets(nb = 2) {
        const bullets = [];
        for (let item of this.bullets) {
            if (!item.active) {
                bullets.push(item);
                if (bullets.length === nb)
                    return bullets;
            }
        }
        //other wise create new bullet then return
        for (let i = 0; i < nb; i++) {
            let item = new entities_1.Bullet();
            bullets.push(item);
            this.bullets.push(item);
            if (bullets.length === nb)
                break;
        }
        return bullets;
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
}
__decorate([
    schema_1.type([entities_1.Player])
], Shooter.prototype, "players", void 0);
__decorate([
    schema_1.type([Boss_1.Boss])
], Shooter.prototype, "bosses", void 0);
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
