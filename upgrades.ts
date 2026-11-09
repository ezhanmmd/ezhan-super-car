// upgrades.ts - 8 upgrades, 10 levels each. They are SAVED, so they stay.
// The "eff..." functions mix the car's stats with your upgrade levels.

const UP_ENGINE = 0
const UP_TURBO = 1
const UP_TIRES = 2
const UP_NITRO = 3
const UP_ARMOR = 4
const UP_MISSILE = 5
const UP_JET = 6
const UP_SLIME = 7
const NUM_UPGRADES = 8
const MAX_LEVEL = 10

let upgradeNames = ["Engine", "Turbo", "Tires", "Nitro Tank", "Armor", "Missile Pod", "Jet Fuel", "Slime Guard"]
let upgradeInfo = ["+top speed", "+acceleration", "+grip +turning", "+nitro size", "+health", "+missiles in storm", "+flight time", "-slime slowdown"]
let upgradeLevel = [0, 0, 0, 0, 0, 0, 0, 0]

function upgradeCost(u: number, lvl: number): number {
    return 500 + lvl * lvl * 400 + u * 100
}

function effTopSpeed(): number { return carTop[currentCar] + upgradeLevel[UP_ENGINE] * 4 }
function effAccel(): number { return carAccel[currentCar] + upgradeLevel[UP_TURBO] * 0.25 }
function effTurn(): number { return carTurn[currentCar] + upgradeLevel[UP_TIRES] * 0.25 }
function effGrip(): number { return carGrip[currentCar] + upgradeLevel[UP_TIRES] * 0.012 }
function effNitroMax(): number { return 100 + upgradeLevel[UP_NITRO] * 20 }
function effMaxHp(): number { return carHp[currentCar] + upgradeLevel[UP_ARMOR] * 15 }
function effStormCount(): number {
    let n = 8 + upgradeLevel[UP_MISSILE]
    if (mySpecial() == SP_SUPER) { n += 4 }
    return Math.min(20, n)
}
function effMissileDamage(): number { return 10 + upgradeLevel[UP_MISSILE] * 2 }
function effFlightMs(): number {
    let ms = 800 + upgradeLevel[UP_JET] * 80
    if (hasSpecial(SP_JET)) { ms = ms * 2 }
    return ms
}
function effRocketFuelMax(): number { return 100 + upgradeLevel[UP_JET] * 15 }
function effSlimeSlow(): number {
    if (hasSpecial(SP_SLIME) || hasSpecial(SP_HOVER)) { return 1 }
    return 0.55 + upgradeLevel[UP_SLIME] * 0.04
}

function setUpgradeAtLeast(u: number, lvl: number) {
    if (upgradeLevel[u] < lvl) {
        upgradeLevel[u] = Math.min(MAX_LEVEL, lvl)
        saveUpgrades()
    }
}

function levelBar(lvl: number): string {
    let s = ""
    let i = 0
    while (i < MAX_LEVEL) {
        s = s + (i < lvl ? "|" : ".")
        i += 1
    }
    return s
}

function openUpgrades(done: () => void) {
    let items: string[] = []
    let u = 0
    while (u < NUM_UPGRADES) {
        let lvl = upgradeLevel[u]
        let price = lvl >= MAX_LEVEL ? "MAX" : "$" + upgradeCost(u, lvl)
        items.push(upgradeNames[u] + " " + levelBar(lvl) + " " + price)
        u += 1
    }
    items.push("MAX EVERYTHING")
    items.push("Reset upgrades")
    showMenu("UPGRADES (saved)", items, function (pick: number) {
        if (pick < NUM_UPGRADES) {
            if (upgradeLevel[pick] >= MAX_LEVEL) {
                errorSound()
                popupText("ALREADY MAX", 2)
            } else {
                spendCoins(upgradeCost(pick, upgradeLevel[pick]))
                upgradeLevel[pick] += 1
                saveUpgrades()
                buySound()
                popupText(upgradeNames[pick] + " " + upgradeInfo[pick], 7)
            }
        } else if (pick == NUM_UPGRADES) {
            let i = 0
            while (i < NUM_UPGRADES) {
                spendCoins(upgradeCost(i, upgradeLevel[i]))
                upgradeLevel[i] = MAX_LEVEL
                i += 1
            }
            saveUpgrades()
            winFanfare()
        } else {
            let k = 0
            while (k < NUM_UPGRADES) {
                upgradeLevel[k] = 0
                k += 1
            }
            saveUpgrades()
            squishSound()
        }
        applyStats()
        openUpgrades(done)
    }, done)
}
