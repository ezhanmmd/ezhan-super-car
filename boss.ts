// boss.ts - the MEGA JET KING boss race. 3 phases:
// phase 1 aimed missiles, phase 2 missile RINGS, phase 3 slime + jet dashes.
// Win by finishing first OR by crunching his HP to zero.
let boss: Sprite = null
let bossHp = 0
let bossMaxHp = 400
let bossPhase = 1
let bossWp = 1
let bossLap = 0
let bossHeading = 0
let bossLastShot = 0
let bossDefeated = false
let bossFinished = false

function spawnBoss() {
    removeBoss()
    bossMaxHp = 300 + difficulty * 60
    bossHp = bossMaxHp
    bossPhase = 1
    bossWp = 1
    bossLap = 0
    bossDefeated = false
    bossFinished = false
    boss = sprites.create(bossImage(1), SpriteKind.Boss)
    let g = gridPos(1)
    boss.setPosition(g[0], g[1])
    boss.z = 12
    bossHeading = startHeading
    bossIntroSound()
}

function removeBoss() {
    if (boss) { boss.destroy() }
    boss = null
}

function damageBoss(n: number) {
    if (!boss || bossDefeated) { return }
    bossHp -= n
    sparks(boss.x, boss.y, 5, 4, 40)
    crunchSound()
    let ph = bossHp < bossMaxHp / 3 ? 3 : (bossHp < bossMaxHp * 2 / 3 ? 2 : 1)
    if (ph != bossPhase) {
        bossPhase = ph
        boss.setImage(bossImage(ph))
        popupText("BOSS PHASE " + ph + "!", 2)
        bossIntroSound()
    }
    if (bossHp <= 0) {
        bossDefeated = true
        explosion(boss.x, boss.y, true)
        explosion(boss.x + 6, boss.y - 4, true)
        confetti(30)
        popupText("MEGA JET KING CRUNCHED!", 5)
        boss.destroy()
        boss = null
    }
}

function updateBoss() {
    if (!boss) { return }
    let now = game.runtime()
    if (distToWp(boss, bossWp) < 16) {
        bossWp = (bossWp + 1) % NUM_WAYPOINTS
        if (bossWp == 1) {
            bossLap += 1
            if (bossLap >= totalLaps) { bossFinished = true }
        }
    }
    let want = Math.atan2(wayY[bossWp] - boss.y, wayX[bossWp] - boss.x) * 180 / Math.PI
    bossHeading = turnToward(bossHeading, want, 8)
    let spd = 62 + difficulty * 3 + bossPhase * 6
    if (bossPhase == 3 && Math.floor(now / 2000) % 3 == 0) { spd += 40 }   // jet dash
    if (bossFinished) { spd = 0 }
    let rad = bossHeading * Math.PI / 180
    boss.vx = Math.cos(rad) * spd
    boss.vy = Math.sin(rad) * spd
    if (now - bossLastShot > 2600 - bossPhase * 400) {
        bossLastShot = now
        if (bossPhase == 1) {
            launchMissile(boss.x, boss.y, Math.atan2(player.y - boss.y, player.x - boss.x) * 180 / Math.PI, 90, true)
        } else if (bossPhase == 2) {
            missileStorm(boss.x, boss.y, 10, true)
        } else {
            dropSlime(boss.x, boss.y, 10, 8000, false)
            missileStorm(boss.x, boss.y, 12, true)
        }
    }
}

function drawBossBar() {
    if (!boss) { return }
    screen.fillRect(40, 112, 80, 6, 15)
    screen.fillRect(41, 113, Math.floor(78 * bossHp / bossMaxHp), 4, 2)
    screen.print("MEGA JET KING", 44, 104, 2, image.font5)
}
