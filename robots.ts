// robots.ts - ROBOT ADD-ONS from the shop: robot arms, drone helper,
// auto-turret and robo-shield. 40 models x 15 colors = 600 items, wear 4.
const ROBO_ARMS = 0
const ROBO_DRONE = 1
const ROBO_TURRET = 2
const ROBO_SHIELD = 3
let roboTypeNames = ["Robot Arms", "Drone Helper", "Auto-Turret", "Robo-Shield"]
let roboModels = ["Mk1", "Mk2", "Turbo", "Mega", "Ultra", "Nano", "Titan", "Omega", "Ezhan", "Hyper"]
let drone: Sprite = null
let lastTurretShot = 0
let roboShieldReadyAt = 0

function robotType(id: number): number { return Math.floor(id / 15) % 4 }
function robotName(id: number): string {
    return colorNames[id % 15] + " " + roboTypeNames[robotType(id)] + " " + roboModels[Math.floor(id / 60)]
}
function robotLevel(id: number): number { return Math.floor(id / 60) + 1 }

function hasRobot(type: number): number {
    let best = 0
    let list = equipped[CAT_ROBOT]
    let i = 0
    while (i < list.length) {
        if (robotType(list[i]) == type) { best = Math.max(best, robotLevel(list[i])) }
        i += 1
    }
    return best
}

function refreshRobots() {
    if (hasRobot(ROBO_DRONE) > 0 || botEquipped(BOT_GURLAG)) {
        if (!drone) {
            drone = sprites.create(img`
                . 1 . 1 .
                1 8 8 8 1
                . 8 5 8 .
                1 8 8 8 1
                . 1 . 1 .
            `, SpriteKind.Drone)
            drone.z = 30
            drone.setFlag(SpriteFlag.Ghost, true)
        }
    } else if (drone) {
        drone.destroy()
        drone = null
    }
}

// called every frame while racing
function updateRobots() {
    if (!player) { return }
    let now = game.runtime()
    if (drone) {
        // drone orbits you and grabs coins + keys it touches
        let a = now / 300
        drone.setPosition(player.x + Math.cos(a) * 14, player.y + Math.sin(a) * 14)
        let cs = sprites.allOfKind(SpriteKind.Food)
        let i = 0
        while (i < cs.length) {
            if (distTo(cs[i], drone) < 8) {
                cs[i].destroy()
                earnCoins(100)
                popSound()
            }
            i += 1
        }
        if (keySprite && distTo(keySprite, drone) < 8) { collectKey() }
    }
    // robot arms grab coins from further away
    let arms = hasRobot(ROBO_ARMS)
    if (arms > 0) {
        let cs2 = sprites.allOfKind(SpriteKind.Food)
        let k = 0
        while (k < cs2.length) {
            if (distTo(cs2[k], player) < 18 + arms * 2) {
                cs2[k].vx = (player.x - cs2[k].x) * 4
                cs2[k].vy = (player.y - cs2[k].y) * 4
            }
            k += 1
        }
    }
    // auto-turret shoots the closest rival
    let tur = hasRobot(ROBO_TURRET)
    let turretEvery = botEquipped(BOT_CODE) ? 1200 : 2000
    if ((tur > 0 || botEquipped(BOT_CODE)) && now - lastTurretShot > turretEvery - tur * 80) {
        let target = closestEnemy(player, 70)
        if (target) {
            lastTurretShot = now
            let ang = Math.atan2(target.y - player.y, target.x - player.x) * 180 / Math.PI
            launchMissile(player.x, player.y, ang, 130, false)
        }
    }
}

// robo-shield blocks one hit, then recharges
function useRoboShield(): boolean {
    let lvl = hasRobot(ROBO_SHIELD)
    if (botEquipped(BOT_REMI)) { lvl = Math.max(lvl, 3) }
    if (lvl > 0 && game.runtime() > roboShieldReadyAt) {
        roboShieldReadyAt = game.runtime() + 14000 - lvl * 800
        shieldSound()
        sparks(player.x, player.y, 9, 8, 40)
        popupText("ROBO-SHIELD BLOCK!", 9)
        return true
    }
    return false
}

function closestEnemy(from: Sprite, range: number): Sprite {
    let best: Sprite = null
    let bestD = range
    let i = 0
    while (i < rivals.length) {
        let d = distTo(from, rivals[i])
        if (d < bestD) { bestD = d; best = rivals[i] }
        i += 1
    }
    if (boss && distTo(from, boss) < bestD) { best = boss }
    return best
}
