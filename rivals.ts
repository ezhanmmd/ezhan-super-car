// rivals.ts - up to 10 AI rivals. Each has a trait:
// 0 racer, 1 slime dropper, 2 jet jumper, 3 missile shooter, 4 rammer
let rivalRoster = ["Turbo Tariq", "Slime Sam", "Jet Jasmine", "Rocket Rami", "Missile Max", "Drift Dana", "Captain Crunch", "Neon Nora", "Blaze", "Shadow"]
let rivalColors = [4, 7, 9, 2, 15, 10, 14, 3, 5, 12]
let rivalShapes = [0, 6, 2, 3, 1, 11, 5, 7, 4, 13]
let rivalTraits = [0, 1, 2, 2, 3, 0, 4, 0, 3, 4]
let rivalSkills = [6, 5, 7, 7, 6, 8, 5, 6, 8, 9]
const MAX_RIVALS = 10

let rivals: Sprite[] = []
let rivalImgs: Image[][] = []
let rivalWp: number[] = []
let rivalLap: number[] = []
let rivalHeading: number[] = []
let rivalSpeed: number[] = []
let rivalStunUntil: number[] = []
let rivalHp: number[] = []
let rivalFinished: boolean[] = []
let rivalLastAct: number[] = []
let rivalChase = false
let finishOrder: string[] = []

function clearRivals() {
    let i = 0
    while (i < rivals.length) { rivals[i].destroy(); i += 1 }
    rivals = []
    rivalImgs = []
    rivalWp = []
    rivalLap = []
    rivalHeading = []
    rivalSpeed = []
    rivalStunUntil = []
    rivalHp = []
    rivalFinished = []
    rivalLastAct = []
    finishOrder = []
}

function spawnRivals(count: number) {
    clearRivals()
    let i = 0
    while (i < Math.min(MAX_RIVALS, count)) {
        let base = image.create(16, 16)
        drawCarShape(base, rivalShapes[i], rivalColors[i], 1, 15, 9, 5)
        let imgs = spin16(base)
        rivalImgs.push(imgs)
        let r = sprites.create(imgs[dirIndex(startHeading)], SpriteKind.Enemy)
        let g = gridPos(i + 1)
        r.setPosition(g[0], g[1])
        r.z = 9
        rivals.push(r)
        rivalWp.push(1)
        rivalLap.push(0)
        rivalHeading.push(startHeading)
        rivalSpeed.push(42 + rivalSkills[i] * 3 + difficulty * 4)
        rivalStunUntil.push(0)
        rivalHp.push(30 + difficulty * 5)
        rivalFinished.push(false)
        rivalLastAct.push(game.runtime() + randint(0, 3000))
        i += 1
    }
}

function freezeRivals() {
    let i = 0
    while (i < rivals.length) { rivals[i].setVelocity(0, 0); i += 1 }
}

function distToWp(s: Sprite, w: number): number {
    let dx = wayX[w] - s.x
    let dy = wayY[w] - s.y
    return Math.sqrt(dx * dx + dy * dy)
}

function rivalProgress(i: number): number {
    return rivalLap[i] * 100 + rivalWp[i] * 5 - Math.min(4, distToWp(rivals[i], rivalWp[i]) / 10)
}

function turnToward(cur: number, target: number, step: number): number {
    let diff = target - cur
    while (diff > 180) { diff -= 360 }
    while (diff < -180) { diff += 360 }
    diff = Math.max(0 - step, Math.min(step, diff))
    let out = cur + diff
    if (out >= 360) { out -= 360 }
    if (out < 0) { out += 360 }
    return out
}

function updateRivals() {
    let now = game.runtime()
    let pProg = playerProgress()
    let i = 0
    while (i < rivals.length) {
        let r = rivals[i]
        if (rivalFinished[i]) {
            r.setVelocity(r.vx * 0.9, r.vy * 0.9)
            i += 1
            continue
        }
        if (now < rivalStunUntil[i]) {
            rivalHeading[i] = (rivalHeading[i] + 30) % 360
            r.setVelocity(r.vx * 0.85, r.vy * 0.85)
            r.setImage(rivalImgs[i][dirIndex(rivalHeading[i])])
            i += 1
            continue
        }
        let tx = player.x
        let ty = player.y
        if (!rivalChase) {
            tx = wayX[rivalWp[i]]
            ty = wayY[rivalWp[i]]
            if (distToWp(r, rivalWp[i]) < 14) {
                // take the shortcut sometimes (if the gate is open)
                if (hasBranch(trackId) && rivalWp[i] == brFrom[trackId] && !branchGated(trackId) && randint(0, 1) == 0) {
                    rivalWp[i] = brTo[trackId]
                } else {
                    rivalWp[i] = (rivalWp[i] + 1) % NUM_WAYPOINTS
                }
                if (rivalWp[i] == 1) {
                    rivalLap[i] += 1
                    if (rivalLap[i] >= totalLaps && totalLaps > 0) {
                        rivalFinished[i] = true
                        finishOrder.push(rivalRoster[i])
                    }
                }
            }
        }
        let want = Math.atan2(ty - r.y, tx - r.x) * 180 / Math.PI
        rivalHeading[i] = turnToward(rivalHeading[i], want, 7 + rivalSkills[i] * 0.5)
        let spd = rivalSpeed[i] * (0.7 + weatherGrip() * 0.3)
        let gap = pProg - rivalProgress(i)
        if (!rivalChase) {
            if (gap > 25) { spd += 25 } else if (gap > 10) { spd += 12 } else if (gap < -25) { spd -= 15 }
        }
        let s = surfaceAt(r.x, r.y)
        if (s == SURF_OFF) { spd = spd * 0.6 }
        if (s == SURF_SLIME) { spd = spd * 0.7 }
        if (s == SURF_BOOST || (s == SURF_RAMP && rivalTraits[i] == 2)) { spd += 30 }
        let rad = rivalHeading[i] * Math.PI / 180
        r.vx = Math.cos(rad) * spd
        r.vy = Math.sin(rad) * spd
        r.setImage(rivalImgs[i][dirIndex(rivalHeading[i])])
        // traits
        if (now - rivalLastAct[i] > 7000 - difficulty * 400) {
            rivalLastAct[i] = now
            let tr = rivalTraits[i]
            if (tr == 1) {
                dropSlime(r.x - Math.cos(rad) * 10, r.y - Math.sin(rad) * 10, 7, 7000, false)
            } else if (tr == 3 && distTo(r, player) < 70) {
                launchMissile(r.x, r.y, Math.atan2(player.y - r.y, player.x - r.x) * 180 / Math.PI, 80, true)
            } else if (tr == 4 && distTo(r, player) < 40) {
                rivalSpeed[i] += 1
            }
        }
        i += 1
    }
}

function rivalIndexOf(s: Sprite): number {
    return rivals.indexOf(s)
}

function hitRival(i: number, dmg: number) {
    rivalStunUntil[i] = game.runtime() + 800
    rivalHp[i] -= dmg
    sparks(rivals[i].x, rivals[i].y, 4, 5, 40)
    if (rivalHp[i] <= 0) {
        explosion(rivals[i].x, rivals[i].y, true)
        rivalHp[i] = 30 + difficulty * 5
        rivalStunUntil[i] = game.runtime() + 2000
        wrecksCaused += 1
        earnCoins(300)
        if (rivalChase) {
            let c = randint(0, 3)
            rivals[i].setPosition([20, 140, 140, 20][c], [26, 26, 108, 108][c])
        }
    }
}

function playerPosition(): number {
    let pProg = playerProgress()
    let pos = 1
    let i = 0
    while (i < rivals.length) {
        if (rivalFinished[i] || rivalProgress(i) > pProg) { pos += 1 }
        i += 1
    }
    if (boss && bossFinished) { pos += 1 }
    return pos
}

function placeText(p: number): string {
    if (p == 1) { return "1st" }
    if (p == 2) { return "2nd" }
    if (p == 3) { return "3rd" }
    return p + "th"
}
