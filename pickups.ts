// pickups.ts - coins, 10 power-ups, rocket fuel cans, and all the collisions.
let powerNames = ["BOOST!", "SHIELD!", "AMMO +5", "NITRO!", "MAGNET!", "LIGHTNING!", "REPAIR!", "MISSILE STORM!", "SLIME BOMBS!", "MYSTERY!"]
let powerColors = [5, 8, 2, 9, 10, 4, 7, 3, 6, 1]
let lastPowerSpawn = 0
let lastCoinSpawn = 0
let lastFuelSpawn = 0
let lightningUntil = 0
let wrecksCaused = 0

let coinImg = img`
    . 5 5 5 .
    5 5 4 5 5
    5 4 5 4 5
    5 5 4 5 5
    . 5 5 5 .
`

function spawnCoin() {
    let c = sprites.create(coinImg, SpriteKind.Food)
    let w = randint(0, NUM_WAYPOINTS - 1)
    c.setPosition(wayX[w] + randint(-6, 6), wayY[w] + randint(-6, 6))
    c.lifespan = 15000
    c.z = 5
}

function spawnPowerUp() {
    let kind = randint(0, 9)
    let im = image.create(8, 8)
    im.fillCircle(4, 4, 3, powerColors[kind])
    im.drawCircle(4, 4, 3, 1)
    im.setPixel(4, 4, 15)
    let p = sprites.create(im, SpriteKind.PowerUp)
    let w = randint(1, NUM_WAYPOINTS - 1)
    p.setPosition(wayX[w] + randint(-5, 5), wayY[w] + randint(-5, 5))
    p.data = "" + kind
    p.lifespan = 9000
    p.z = 5
}

function spawnFuel() {
    let f = sprites.create(img`
        . 2 2 .
        2 4 4 2
        2 4 4 2
        2 2 2 2
    `, SpriteKind.Fuel)
    let w = randint(1, NUM_WAYPOINTS - 1)
    f.setPosition(wayX[w], wayY[w])
    f.lifespan = 10000
}

function applyPowerUp(kind: number) {
    if (kind == 9) {
        kind = randint(0, 8)
        earnCoins(500)
    }
    popSound()
    flashLights(powerColors[kind])
    let now = game.runtime()
    if (kind == 0) { boostUntil = now + 3000 }
    else if (kind == 1) { shieldUntil = now + 4000; shieldSound() }
    else if (kind == 2) { missileAmmo += 5 }
    else if (kind == 3) { nitro = nitroMax }
    else if (kind == 4) { magnetUntil = now + 6000 }
    else if (kind == 5) {
        let i = 0
        while (i < rivals.length) { rivalStunUntil[i] = now + 1500; i += 1 }
        damageBoss(25)
        thunderSound()
        lightningUntil = now + 200
    }
    else if (kind == 6) { hp = maxHp }
    else if (kind == 7) { stormCharges += 1 }
    else { slimeBombs += 3 }
    popupText(powerNames[kind], powerColors[kind])
}

function pullCoins() {
    if (game.runtime() > magnetUntil) { return }
    let cs = sprites.allOfKind(SpriteKind.Food)
    let i = 0
    while (i < cs.length) {
        if (distTo(cs[i], player) < 50) {
            cs[i].vx = (player.x - cs[i].x) * 3
            cs[i].vy = (player.y - cs[i].y) * 3
        }
        i += 1
    }
}

function updatePickups() {
    let now = game.runtime()
    if (now - lastCoinSpawn > 1400 && sprites.allOfKind(SpriteKind.Food).length < 7) {
        lastCoinSpawn = now
        spawnCoin()
    }
    if (now - lastPowerSpawn > 4000 && sprites.allOfKind(SpriteKind.PowerUp).length < 3) {
        lastPowerSpawn = now
        spawnPowerUp()
    }
    if (canRocket() && now - lastFuelSpawn > 5000) {
        lastFuelSpawn = now
        spawnFuel()
    }
    steerMissiles()
    pullCoins()
    animateKey()
}

function clearPickups() {
    let kinds = [SpriteKind.Food, SpriteKind.PowerUp, SpriteKind.Missile, SpriteKind.EnemyMissile, SpriteKind.Slime, SpriteKind.Particle, SpriteKind.Fuel, SpriteKind.Shadow]
    let k = 0
    while (k < kinds.length) {
        clearKind(kinds[k])
        k += 1
    }
    shadowSprite = null
    removeKey()
}

function setupCollisions() {
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (p, c) {
        c.destroy()
        earnCoins(100)
        coinSound()
        info.changeScoreBy(10)
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.PowerUp, function (p, pu) {
        let k = parseInt(pu.data)
        pu.destroy()
        applyPowerUp(k)
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Fuel, function (p, f) {
        f.destroy()
        rocketFuel = rocketFuelMax
        popSound()
        popupText("ROCKET FUEL!", 4)
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Key, function (p, k) {
        collectKey()
    })
    sprites.onOverlap(SpriteKind.Missile, SpriteKind.Enemy, function (m, e) {
        m.destroy()
        let i = rivalIndexOf(e)
        if (i >= 0) {
            hitRival(i, effMissileDamage())
            explosion(m.x, m.y, false)
        }
    })
    sprites.onOverlap(SpriteKind.Missile, SpriteKind.Boss, function (m, b) {
        m.destroy()
        explosion(m.x, m.y, false)
        damageBoss(effMissileDamage())
    })
    sprites.onOverlap(SpriteKind.EnemyMissile, SpriteKind.Player, function (m, p) {
        m.destroy()
        if (isFlying()) { return }
        explosion(m.x, m.y, false)
        damagePlayer(10)
        stunnedUntil = game.runtime() + 400
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Slime, function (p, s) {
        if (isFlying() || hasSpecial(SP_HOVER) || s.data == "me") { return }
        squishSound()
        speed = speed * effSlimeSlow()
        if (!hasSpecial(SP_SLIME)) { heading += randint(-20, 20) }
        slimeSplat(s.x, s.y, 7)
        s.destroy()
    })
    sprites.onOverlap(SpriteKind.Enemy, SpriteKind.Slime, function (e, s) {
        let i = rivalIndexOf(e)
        if (i >= 0 && s.data == "me") {
            rivalStunUntil[i] = game.runtime() + 1200
            squishSound()
            slimeSplat(s.x, s.y, 7)
            s.destroy()
        }
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (p, e) {
        if (isFlying() || game.runtime() - lastBumpAt < 400) { return }
        lastBumpAt = game.runtime()
        let i = rivalIndexOf(e)
        crunchSound()
        let push = hasRobot(ROBO_ARMS) > 0 ? 2 : 1
        if (i >= 0) {
            rivalStunUntil[i] = game.runtime() + 300 * push
            hitRival(i, hasSpecial(SP_TANK) ? 12 : 4 * push)
        }
        damagePlayer(3)
        speed = speed * 0.8
    })
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Boss, function (p, b) {
        if (isFlying() || game.runtime() - lastBumpAt < 500) { return }
        lastBumpAt = game.runtime()
        megaCrunchSound()
        damagePlayer(12)
        damageBoss(5)
        speed = 0 - speed * 0.5
    })
}
