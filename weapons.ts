// weapons.ts - MISSILES (forward, homing, and the ALL-DIRECTIONS missile storm),
// slime bombs, enemy missiles and slime puddles.
let missileImgs: Image[] = []
let lastFireAt = 0

function missileColor(): number {
    let list = equipped[CAT_MISSILE_SKIN]
    if (list.length == 0) { return 2 }
    return (list[0] % 15) + 1
}

function missileImage(color: number): Image {
    let im = image.create(4, 4)
    im.fillRect(0, 1, 4, 2, color)
    im.setPixel(3, 1, 1)
    im.setPixel(3, 2, 1)
    return im
}

// one missile at angle deg (degrees)
function launchMissile(x: number, y: number, deg: number, spd: number, enemy: boolean) {
    let im = missileImage(enemy ? 4 : missileColor())
    let m = sprites.create(im, enemy ? SpriteKind.EnemyMissile : SpriteKind.Missile)
    let rad = deg * Math.PI / 180
    m.setPosition(x + Math.cos(rad) * 8, y + Math.sin(rad) * 8)
    m.setVelocity(Math.cos(rad) * spd, Math.sin(rad) * spd)
    m.lifespan = 1100
    m.z = 15
    m.setFlag(SpriteFlag.AutoDestroy, true)
}

// THE MISSILE STORM: missiles fly out in ALL directions at once
function missileStorm(x: number, y: number, count: number, enemy: boolean) {
    let i = 0
    while (i < count) {
        launchMissile(x, y, i * 360 / count, 120, enemy)
        i += 1
    }
    missileStormSound()
    shake(3, 200)
}

function fireWeapon() {
    let now = game.runtime()
    if (now - lastFireAt < 250) { return }
    lastFireAt = now
    if (hasSpecial(SP_SLIME) && slimeBombs > 0 && !hasSpecial(SP_MISSILE)) {
        slimeBombs -= 1
        dropSlimeBehind()
        return
    }
    if (missileAmmo <= 0 && stormCharges <= 0) {
        errorSound()
        popupText("NO AMMO", 2)
        return
    }
    if ((hasSpecial(SP_MISSILE) || stormCharges > 0) && (missileAmmo >= 4 || stormCharges > 0)) {
        if (hasSpecial(SP_MISSILE)) { missileAmmo = Math.max(0, missileAmmo - 4) } else { stormCharges -= 1 }
        missileStorm(player.x, player.y, effStormCount(), false)
        popupText("MISSILE STORM!", 2)
        if (mySpecial() == SP_SUPER) { dropSlimeBehind() }
        return
    }
    missileAmmo -= 1
    launchMissile(player.x, player.y, heading, 150, false)
    if (hasSpecial(SP_TANK)) {
        launchMissile(player.x, player.y, heading - 10, 150, false)
        launchMissile(player.x, player.y, heading + 10, 150, false)
    }
    missileLaunchSound()
}

// homing: your missiles bend toward the closest rival or boss
function steerMissiles() {
    let ms = sprites.allOfKind(SpriteKind.Missile)
    let i = 0
    while (i < ms.length) {
        let t = closestEnemy(ms[i], 50)
        if (t) {
            let a = Math.atan2(t.y - ms[i].y, t.x - ms[i].x)
            ms[i].vx = ms[i].vx * 0.88 + Math.cos(a) * 150 * 0.12
            ms[i].vy = ms[i].vy * 0.88 + Math.sin(a) * 150 * 0.12
        }
        i += 1
    }
}

// ---------- slime ----------
function slimeColor(): number {
    let list = equipped[CAT_SLIME_COLOR]
    if (list.length == 0) { return 7 }
    return (list[0] % 15) + 1
}

function dropSlime(x: number, y: number, color: number, life: number, mine: boolean) {
    let im = image.create(9, 7)
    im.fillCircle(4, 3, 3, color)
    im.setPixel(2, 2, 1)
    im.setPixel(1, 5, color)
    im.setPixel(7, 5, color)
    let s = sprites.create(im, SpriteKind.Slime)
    s.setPosition(x, y)
    s.z = 2
    s.lifespan = life
    s.data = mine ? "me" : "them"
    splatSound()
    slimeSplat(x, y, color)
}

function dropSlimeBehind() {
    let rad = heading * Math.PI / 180
    dropSlime(player.x - Math.cos(rad) * 12, player.y - Math.sin(rad) * 12, slimeColor(), 9000, true)
    popupText("SLIME BOMB!", 7)
}
