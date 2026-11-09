// player.ts - YOUR car: driving physics, drifting, surfaces, damage, and the
// picture of the car with every shop item you are wearing drawn on top.
// Heading 0 = facing right. The car slides a little (grip) so drifting works.

let player: Sprite = null
let playerImgs: Image[] = []
let heading = 0
let speed = 0
let velX = 0
let velY = 0
let hp = 100
let maxHp = 100
let slipAngle = 0
let shieldUntil = 0
let boostUntil = 0
let magnetUntil = 0
let stunnedUntil = 0
let missileAmmo = 6
let slimeBombs = 5
let stormCharges = 3
let lastBumpAt = 0
let lastLavaAt = 0
let lastTrailAt = 0
let lastExhaustAt = 0
let wreckedAt = 0
let wrecks = 0
let gasOn = false

// ---------- patterns used by paint kits and decals (30 of them) ----------
function patternHit(p: number, x: number, y: number): boolean {
    let ax = Math.abs(x - 8)
    let ay = Math.abs(y - 8)
    if (p == 0) { return y == 7 || y == 8 }
    if (p == 1) { return (x + y) % 4 == 0 }
    if (p == 2) { return (Math.floor(x / 2) + Math.floor(y / 2)) % 2 == 0 }
    if (p == 3) { return x > 9 && (x + y * 2) % 5 == 0 }
    if (p == 4) { return x == 6 + (y % 3) }
    if (p == 5) { return (x * 7 + y * 13) % 11 == 0 }
    if (p == 6) { return ((x * 3) ^ (y * 5)) % 7 < 2 }
    if (p == 7) { return (x + Math.floor(y / 2)) % 3 == 0 }
    if (p == 8) { return x < 4 && y % 2 == 0 }
    if (p == 9) { return y % 3 == 0 }
    if (p == 10) { return x < 5 }
    if (p == 11) { return (y == 4 || y == 11) && x > 3 }
    if (p == 12) { return (x * y) % 5 == 0 }
    if (p == 13) { return y == 7 + Math.round(2 * Math.sin(x)) }
    if (p == 14) { return x == 8 || y == 8 || x == y || x + y == 16 }
    if (p == 15) { return ax + ay < 4 }
    if (p == 16) { return y < 6 && x % 3 == 0 }
    if (p == 17) { return ax + ay == 4 }
    if (p == 18) { return x < 8 }
    if (p == 19) { return x % 3 == 1 && y % 3 == 1 }
    if (p == 20) {
        let d = ax * ax + ay * ay
        return (d >= 9 && d <= 16) || (d >= 36 && d <= 49)
    }
    if (p == 21) { return ay == x - 6 }
    if (p == 22) { return (ay == 2 && (x == 6 || x == 9)) || (y == 10 && x > 5 && x < 11) }
    if (p == 23) { return (x - 9) * (x - 9) + ay * ay < 9 && (x - 10) * (x - 10) + (y - 7) * (y - 7) >= 4 }
    if (p == 24) { return (x + y) % 2 == 0 && ax < 4 && ay < 4 }
    if (p == 25) { return (x + 3 * y) % 6 == 0 }
    if (p == 26) { return x > 10 - (y % 4) }
    if (p == 27) { return (x % 4 == 0) != (y % 4 == 0) }
    if (p == 28) { return y == 3 || y == 12 }
    // 29: SUPER E
    return (x == 5 && y > 4 && y < 11) || (x > 4 && x < 9 && (y == 5 || y == 8 || y == 10))
}

// paint pattern p in color c, but ONLY on the car body (not wheels/windows)
function overlayPattern(img: Image, p: number, c: number) {
    let body = partColor[PART_BODY]
    let y = 0
    while (y < 16) {
        let x = 0
        while (x < 16) {
            if (img.getPixel(x, y) == body && patternHit(p, x, y)) {
                img.setPixel(x, y, c)
            }
            x += 1
        }
        y += 1
    }
}

function drawTopper(img: Image, style: number, c: number) {
    if (style == 0) { img.fillRect(4, 7, 1, 2, c); img.setPixel(3, 7, c) }          // antenna
    else if (style == 1) { img.fillRect(0, 3, 1, 10, c) }                            // spoiler
    else if (style == 2) { img.setPixel(6, 6, c); img.setPixel(7, 7, c); img.setPixel(6, 9, c); img.setPixel(7, 8, c) } // crown
    else if (style == 3) { img.setPixel(7, 7, 2); img.setPixel(7, 8, 8) }            // siren
    else if (style == 4) { img.fillRect(2, 7, 4, 2, c) }                             // fin
    else if (style == 5) { img.setPixel(12, 4, c); img.setPixel(12, 11, c) }         // horns
    else if (style == 6) { img.drawCircle(7, 8, 3, c) }                              // halo
    else if (style == 7) { img.fillRect(8, 7, 8, 2, c) }                             // cannon
    else if (style == 8) { img.fillRect(3, 4, 1, 4, 1); img.fillRect(4, 4, 2, 2, c) }// flag
    else if (style == 9) { img.setPixel(9, 6, c); img.setPixel(9, 9, c) }           // cat ears
    else if (style == 10) { img.fillRect(4, 8, 7, 1, c) }                            // mohawk
    else { img.drawCircle(6, 8, 1, c) }                                              // satellite
}

function drawWings(img: Image, style: number, c: number) {
    let w = 2 + (style % 3)
    img.fillRect(5, 0, w, 3, c)
    img.fillRect(5, 13, w, 3, c)
    if (style >= 4) {
        img.setPixel(4, 0, c)
        img.setPixel(4, 15, c)
    }
    if (style == 7) {
        img.setPixel(9, 1, 2)
        img.setPixel(9, 14, 2)
    }
}

// robot add-ons (see robots.ts) also show on the car
function drawRobotParts(img: Image) {
    let list = equipped[CAT_ROBOT]
    let i = 0
    while (i < list.length) {
        let id = list[i]
        let c = (id % 15) + 1
        let type = robotType(id)
        if (type == ROBO_ARMS) {
            img.fillRect(11, 0, 4, 1, c)
            img.fillRect(11, 15, 4, 1, c)
            img.setPixel(15, 0, 1)
            img.setPixel(15, 15, 1)
        } else if (type == ROBO_TURRET) {
            img.fillRect(5, 7, 3, 2, c)
            img.fillRect(8, 7, 3, 1, 15)
        } else if (type == ROBO_SHIELD) {
            img.setPixel(15, 3, c)
            img.setPixel(15, 12, c)
            img.setPixel(0, 2, c)
            img.setPixel(0, 13, c)
        } else {
            img.setPixel(2, 7, c)       // drone dock
            img.setPixel(2, 8, c)
        }
        i += 1
    }
}

// build the car picture from the car shape + paint + EVERYTHING you wear
function buildCarBase(): Image {
    let img = image.create(16, 16)
    drawCarShape(img, carShape[currentCar], partColor[PART_BODY], partColor[PART_STRIPE], partColor[PART_WHEEL], partColor[PART_WINDOW], partColor[PART_LIGHT])
    if (kitPattern >= 0) {
        overlayPattern(img, kitPattern, partColor[PART_STRIPE])
    }
    let i = 0
    while (i < equipped[CAT_DECAL].length) {
        let id = equipped[CAT_DECAL][i]
        overlayPattern(img, decalToPattern[Math.floor(id / 15)], (id % 15) + 1)
        i += 1
    }
    let k = 0
    while (k < equipped[CAT_STICKER].length) {
        let st = equipped[CAT_STICKER][k]
        img.setPixel(5 + (k % 3) * 2, 6 + Math.floor(k / 3) * 3, (st % 15) + 1)
        k += 1
    }
    let n = 0
    while (n < equipped[CAT_NEON].length) {
        let ne = equipped[CAT_NEON][n]
        let pat = Math.floor(ne / 15)
        let x = 1
        while (x < 15) {
            if (pat == 0 || (x + pat + n) % (pat + 1) == 0) {
                img.setPixel(x, n == 0 ? 0 : 15, (ne % 15) + 1)
                img.setPixel(x, n == 0 ? 15 : 0, (ne % 15) + 1)
            }
            x += 1
        }
        n += 1
    }
    let t = 0
    while (t < equipped[CAT_TOPPER].length) {
        let tp = equipped[CAT_TOPPER][t]
        drawTopper(img, Math.floor(tp / 15), (tp % 15) + 1)
        t += 1
    }
    if (equipped[CAT_WINGS].length > 0) {
        let wg = equipped[CAT_WINGS][0]
        drawWings(img, Math.floor(wg / 15), (wg % 15) + 1)
    }
    let b = 0
    while (b < equipped[CAT_BOOSTER].length) {
        let bo = equipped[CAT_BOOSTER][b]
        img.fillRect(0, 4 + b * 6, 2, 2, (bo % 15) + 1)
        img.setPixel(0, 4 + b * 6, 4)
        b += 1
    }
    if (equipped[CAT_RIMS].length > 0) {
        let rc = (equipped[CAT_RIMS][0] % 15) + 1
        img.setPixel(3, 1, rc)
        img.setPixel(11, 1, rc)
        img.setPixel(3, 14, rc)
        img.setPixel(11, 14, rc)
    }
    drawRobotParts(img)
    return img
}

function rebuildPlayerImages() {
    playerImgs = spin16(buildCarBase())
    if (player) {
        player.setImage(playerImgs[dirIndex(heading)])
    }
}

function applyStats() {
    maxHp = effMaxHp()
    if (hp > maxHp) { hp = maxHp }
    nitroMax = effNitroMax() + connectNitroBonus
    rocketFuelMax = effRocketFuelMax()
}

function createPlayer() {
    if (player) {
        player.destroy()
    }
    rebuildPlayerImages()
    player = sprites.create(playerImgs[0], SpriteKind.Player)
    player.z = 10
    applyStats()
}

function placePlayer(x: number, y: number, deg: number) {
    player.setPosition(x, y)
    heading = deg
    speed = 0
    velX = 0
    velY = 0
    hp = maxHp
    nitro = nitroMax
    rocketFuel = rocketFuelMax
    player.setImage(playerImgs[dirIndex(heading)])
}

function damagePlayer(n: number) {
    if (game.runtime() < shieldUntil || wreckedAt > 0) {
        return
    }
    if (useRoboShield()) {
        return
    }
    if (hasSpecial(SP_TANK)) {
        n = Math.ceil(n / 2)
    }
    hp -= n
    flashLights(2)
    if (hp <= 0) {
        hp = 0
        wreckPlayer()
    }
}

function wreckPlayer() {
    wreckedAt = game.runtime()
    wrecks += 1
    explosion(player.x, player.y, true)
    player.setVelocity(0, 0)
    speed = 0
    velX = 0
    velY = 0
    popupText("WRECKED! CRUNCH!", 2)
}

function respawnPlayer() {
    wreckedAt = 0
    let w = (playerWp + NUM_WAYPOINTS - 1) % NUM_WAYPOINTS
    player.setPosition(wayX[w], wayY[w])
    heading = Math.atan2(wayY[playerWp] - wayY[w], wayX[playerWp] - wayX[w]) * 180 / Math.PI
    hp = maxHp
    shieldUntil = game.runtime() + 2000
    popSound()
}

// main physics step, called every frame while racing
function updatePlayerPhysics(canDrive: boolean) {
    let now = game.runtime()
    let top = effTopSpeed()
    let acc = effAccel()
    let grip = effGrip() * weatherGrip()
    let turn = effTurn()
    let gas = canDrive && controller.A.isPressed()
    let brake = canDrive && controller.B.isPressed()
    let left = canDrive && controller.left.isPressed()
    let right = canDrive && controller.right.isPressed()
    gasOn = gas
    if (now < stunnedUntil) {
        gas = false
        heading += 20
    }
    if (now < boostUntil) { top += 35 }
    top += nitroBonus()
    top += rocketBonus(canDrive)
    let air = isFlying()
    if (air) {
        top += 20
        grip = grip * 0.4
    } else {
        let s = surfaceAt(player.x, player.y)
        let hover = hasSpecial(SP_HOVER)
        if (s == SURF_OFF) {
            top = top * (hover ? 0.8 : 0.55)
        } else if (s == SURF_SLIME) {
            top = top * effSlimeSlow()
            if (!hover && !hasSpecial(SP_SLIME)) {
                grip = grip * 0.5
            }
            if (Math.abs(speed) > 10) {
                squishSound()
                if (randint(0, 3) == 0) { slimeSplat(player.x, player.y, 7) }
            }
        } else if (s == SURF_RAMP) {
            if (speed > 30) {
                startFlight(effFlightMs())
            }
        } else if (s == SURF_BOOST) {
            if (now > boostUntil - 900) {
                boostUntil = now + 1200
                boostPadSound()
                sparks(player.x, player.y, 9, 6, 40)
            }
        } else if (s == SURF_LAVA) {
            if (!hover && now - lastLavaAt > 250) {
                lastLavaAt = now
                damagePlayer(4)
                sparks(player.x, player.y, 4, 4, 30)
                crunchSound()
            }
        } else if (s == SURF_ICE) {
            if (!hover) { grip = grip * 0.35 }
        } else if (s == SURF_GATE) {
            // locked secret gate: bounce off it
            player.x -= velX * 0.05
            player.y -= velY * 0.05
            speed = 0 - speed * 0.3
            velX = 0 - velX * 0.3
            velY = 0 - velY * 0.3
            if (now - lastBumpAt > 500) {
                lastBumpAt = now
                crunchSound()
                popupText("LOCKED! Needs a KEY", 5)
            }
        }
    }
    if (gas) {
        speed += acc * 2
    } else if (brake) {
        speed -= 3.5
    } else {
        speed = speed * 0.97
    }
    if (speed > top) { speed = speed * 0.95 }
    if (speed < -35) { speed = -35 }
    if (Math.abs(speed) < 8) { turn = turn * 0.4 }
    let handbrake = brake && Math.abs(speed) > 30 && (left || right)
    if (handbrake) {
        turn = turn * 1.4
        grip = grip * 0.3
        speed += 3
    }
    if (left) { heading -= turn }
    if (right) { heading += turn }
    if (canDrive) { heading += steerAssist() }     // PC Agent bot
    if (heading >= 360) { heading -= 360 }
    if (heading < 0) { heading += 360 }
    let rad = heading * Math.PI / 180
    velX += (Math.cos(rad) * speed - velX) * Math.min(1, grip)
    velY += (Math.sin(rad) * speed - velY) * Math.min(1, grip)
    player.vx = velX
    player.vy = velY
    // slip angle = how sideways you are going (drifting!)
    let mv = Math.sqrt(velX * velX + velY * velY)
    slipAngle = 0
    if (mv > 20 && speed > 0) {
        let moveDeg = Math.atan2(velY, velX) * 180 / Math.PI
        let diff = Math.abs(moveDeg - heading) % 360
        if (diff > 180) { diff = 360 - diff }
        slipAngle = diff
        if (slipAngle > 18 && !air) {
            screechSound()
            particle(player.x, player.y, 15, 0, 0, 500)
        }
    }
    // the screen edge is a wall
    if (player.x < 4 || player.x > 156 || player.y < 13 || player.y > 117) {
        player.x = Math.max(5, Math.min(155, player.x))
        player.y = Math.max(14, Math.min(116, player.y))
        speed = 0 - speed * 0.4
        velX = 0 - velX * 0.4
        velY = 0 - velY * 0.4
        if (now - lastBumpAt > 400) {
            lastBumpAt = now
            crunchSound()
            damagePlayer(2)
        }
    }
    player.setImage(playerImgs[dirIndex(heading)])
    spawnTrails()
    spawnExhaust(gas)
}

// ---------- trails: 12 styles x 15 colors, wear up to 3 ----------
function spawnTrails() {
    let list = equipped[CAT_TRAIL]
    if (list.length == 0 || game.runtime() - lastTrailAt < 70 || Math.abs(speed) < 15) {
        return
    }
    lastTrailAt = game.runtime()
    let rad = heading * Math.PI / 180
    let bx = player.x - Math.cos(rad) * 7
    let by = player.y - Math.sin(rad) * 7
    let i = 0
    while (i < list.length) {
        let id = list[i]
        let style = Math.floor(id / 15)
        let c = (id % 15) + 1
        let side = (i - 1) * 3
        let px = bx - Math.sin(rad) * side
        let py = by + Math.cos(rad) * side
        if (style == 9) { c = randint(1, 14) }                       // rainbow
        if (style == 2 || style == 5) {                               // sparkle / stars
            particle(px + randint(-2, 2), py + randint(-2, 2), c, randint(-10, 10), randint(-10, 10), 300)
        } else if (style == 3 || style == 11) {                       // fire / rocket flame
            particle(px, py, c, 0 - Math.cos(rad) * 30, 0 - Math.sin(rad) * 30, 250)
            particle(px, py, 4, 0 - Math.cos(rad) * 20, 0 - Math.sin(rad) * 20, 200)
        } else if (style == 6) {                                      // zigzag
            particle(px + (Math.floor(game.runtime() / 70) % 2 == 0 ? 2 : -2), py, c, 0, 0, 600)
        } else {
            particle(px, py, c, 0, 0, style == 1 ? 900 : 500)
        }
        i += 1
    }
}

function spawnExhaust(gas: boolean) {
    if (!gas || game.runtime() - lastExhaustAt < 100) {
        return
    }
    lastExhaustAt = game.runtime()
    let rad = heading * Math.PI / 180
    let x = player.x - Math.cos(rad) * 8
    let y = player.y - Math.sin(rad) * 8
    let list = equipped[CAT_EXHAUST]
    if (list.length == 0) {
        smokePuff(x, y, 13)
        return
    }
    let i = 0
    while (i < list.length) {
        smokePuff(x, y, (list[i] % 15) + 1)
        if (Math.floor(list[i] / 15) >= 2) { smokePuff(x, y, 4) }
        i += 1
    }
}

function honk() {
    let hs = equipped[CAT_HORN]
    if (hs.length == 0) {
        defaultHorn()
    } else {
        let i = 0
        while (i < hs.length) {
            playHorn(hs[i])
            i += 1
        }
    }
    flashLights(9)
    let r = 0
    while (r < rivals.length) {
        if (distTo(rivals[r], player) < 30) {
            rivalSpeed[r] = rivalSpeed[r] * 0.9
        }
        r += 1
    }
}

function distTo(a: Sprite, b: Sprite): number {
    let dx = a.x - b.x
    let dy = a.y - b.y
    return Math.sqrt(dx * dx + dy * dy)
}
