// keys.ts - GOLDEN KEYS. One key hides on every track (sometimes in a secret
// shortcut). Keys are SAVED. Spend them to:
//   - open SECRET GATES on track shortcuts
//   - unlock 3 BONUS cars (Golden Key Racer, Robo Mech, Slime King)
//   - unlock the SECRET Rainbow Road track

let keysHeld = 0
let keysFoundTotal = 0
let keySprite: Sprite = null
let keyCollectedThisRace = false
let bonusCarCost = [3, 5, 8]
const SECRET_TRACK_KEYS = 10

function loadKeys() {
    keysHeld = readSave("se_keys", 0)
    keysFoundTotal = readSave("se_keys_total", 0)
}

function saveKeys() {
    writeSave("se_keys", keysHeld)
    writeSave("se_keys_total", keysFoundTotal)
}

function gateOpen(t: number): boolean {
    return readSave("se_gate" + t, 0) == 1
}

function bonusCarKeys(c: number): number {
    return bonusCarCost[c - FIRST_BONUS_CAR]
}

function carUnlocked(c: number): boolean {
    if (c < FIRST_BONUS_CAR) {
        return true
    }
    return readSave("se_bonuscar" + c, 0) == 1
}

function tryUnlockBonusCar(c: number): boolean {
    let cost = bonusCarKeys(c)
    if (keysHeld < cost) {
        return false
    }
    keysHeld -= cost
    writeSave("se_bonuscar" + c, 1)
    saveKeys()
    winFanfare()
    confetti(20)
    return true
}

function secretTrackOpen(): boolean {
    return readSave("se_secret_track", 0) == 1
}

let keyImg = img`
    . 5 5 5 . . . .
    5 4 . 4 5 . . .
    5 . . . 5 5 5 5
    5 4 . 4 5 . 5 .
    . 5 5 5 . . 5 5
`

// put this race's key somewhere: in the secret shortcut if there is one
function spawnKey() {
    removeKey()
    keyCollectedThisRace = false
    if (trackId == ARENA_TRACK) {
        return
    }
    keySprite = sprites.create(keyImg, SpriteKind.Key)
    if (hasBranch(trackId) && randint(0, 1) == 0) {
        keySprite.setPosition(branchMidX(), branchMidY() - 5)
    } else {
        let w = randint(3, NUM_WAYPOINTS - 2)
        keySprite.setPosition(wayX[w] + randint(-4, 4), wayY[w] + randint(-4, 4))
    }
    keySprite.z = 6
}

function removeKey() {
    if (keySprite) {
        keySprite.destroy()
        keySprite = null
    }
}

function collectKey() {
    removeKey()
    keyCollectedThisRace = true
    keysHeld += 1
    keysFoundTotal += 1
    saveKeys()
    bigPopSound()
    sparks(player.x, player.y, 5, 12, 60)
    popupText("GOLDEN KEY! (" + keysHeld + ")", 5)
}

// keys bob up and down and sparkle
function animateKey() {
    if (keySprite && Math.floor(game.runtime() / 150) % 4 == 0) {
        particle(keySprite.x + randint(-3, 3), keySprite.y + randint(-2, 2), 5, 0, -10, 200)
    }
}

function openKeyVault(done: () => void) {
    let items: string[] = []
    items.push("You have " + keysHeld + " keys (found " + keysFoundTotal + ")")
    let t = 0
    let gateTracks: number[] = []
    while (t < trackNames.length) {
        if (brType[t] == 2) {
            gateTracks.push(t)
            items.push((gateOpen(t) ? "OPEN  " : "Open gate (1 key) ") + trackNames[t])
        }
        t += 1
    }
    let c = FIRST_BONUS_CAR
    while (c < NUM_CARS) {
        items.push((carUnlocked(c) ? "GOT   " : "Unlock (" + bonusCarKeys(c) + " keys) ") + carNames[c])
        c += 1
    }
    items.push((secretTrackOpen() ? "OPEN  " : "Unlock (" + SECRET_TRACK_KEYS + " keys) ") + trackNames[SECRET_TRACK])
    items.push("Cheat: +10 keys (test)")
    showMenu("KEY VAULT", items, function (pick: number) {
        let gi = pick - 1
        let ci = pick - 1 - gateTracks.length
        let si = pick - 1 - gateTracks.length - (NUM_CARS - FIRST_BONUS_CAR)
        if (pick == 0) {
            popSound()
        } else if (gi < gateTracks.length) {
            let tt = gateTracks[gi]
            if (gateOpen(tt)) {
                popSound()
            } else if (keysHeld >= 1) {
                keysHeld -= 1
                writeSave("se_gate" + tt, 1)
                saveKeys()
                crunchSound()
                popupText("GATE OPEN!", 7)
            } else {
                errorSound()
            }
        } else if (ci < NUM_CARS - FIRST_BONUS_CAR) {
            let car = FIRST_BONUS_CAR + ci
            if (!carUnlocked(car) && !tryUnlockBonusCar(car)) {
                errorSound()
            }
        } else if (si == 0) {
            if (!secretTrackOpen() && keysHeld >= SECRET_TRACK_KEYS) {
                keysHeld -= SECRET_TRACK_KEYS
                writeSave("se_secret_track", 1)
                trackUnlocked[SECRET_TRACK] = true
                saveKeys()
                winFanfare()
            } else if (!secretTrackOpen()) {
                errorSound()
            }
        } else {
            keysHeld += 10
            saveKeys()
            bigPopSound()
        }
        openKeyVault(done)
    }, done)
}
