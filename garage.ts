// garage.ts - 15 cars, each with its own shape, stats and SPECIAL power.
// The garage menu lets you pick a car, see its stats and open the Paint Maker.

const NUM_CARS = 18          // 15 normal cars + 3 BONUS cars you unlock with KEYS
const FIRST_BONUS_CAR = 15
let carNames = ["Super Ezhan GT", "Missile Mayhem", "Jet Racer", "Rocket Rider", "Formula Flash", "Monster Muncher", "Slime Buggy", "Muscle Max", "Mini Zoom", "Hover Hawk", "Police Pursuit", "Drift Legend", "Sky Plane Car", "Crunch Tank", "SUPER EZHAN X", "Golden Key Racer", "Robo Mech", "Slime King"]
// which drawing (art.ts) each car uses
let carShape = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 13, 6]
let carSpecial = [SP_NONE, SP_MISSILE, SP_JET, SP_ROCKET, SP_NONE, SP_TANK, SP_SLIME, SP_NONE, SP_NONE, SP_HOVER, SP_MISSILE, SP_NONE, SP_JET, SP_TANK, SP_SUPER, SP_SUPER, SP_MISSILE, SP_SLIME]
let carTop = [96, 86, 104, 100, 112, 80, 88, 102, 90, 94, 98, 96, 100, 74, 110, 118, 96, 104]
let carAccel = [3.0, 2.6, 3.2, 3.4, 3.6, 2.4, 2.8, 3.4, 3.6, 3.0, 3.0, 3.0, 3.0, 2.2, 3.6, 4.0, 3.0, 3.4]
let carTurn = [6, 5, 6, 5, 7, 4.5, 6, 5, 7.5, 6.5, 6, 7, 5.5, 4, 7, 7.5, 5.5, 6.5]
let carGrip = [0.18, 0.2, 0.15, 0.14, 0.24, 0.22, 0.16, 0.12, 0.2, 0.1, 0.18, 0.08, 0.15, 0.26, 0.2, 0.24, 0.22, 0.2]
let carHp = [100, 120, 90, 90, 80, 180, 100, 110, 80, 90, 120, 100, 90, 220, 160, 200, 200, 150]
let carAmmo = [6, 30, 6, 6, 4, 10, 6, 6, 4, 6, 12, 6, 8, 20, 40, 60, 50, 20]
// default colors: body, stripe, wheel, window, light
let carColorsBody = [2, 15, 8, 1, 2, 7, 7, 4, 3, 10, 1, 9, 1, 6, 5, 5, 13, 7]
let carColorsStripe = [5, 2, 1, 4, 1, 5, 6, 15, 1, 8, 8, 1, 2, 14, 2, 4, 9, 5]
let carColorsWheel = [15, 15, 12, 15, 15, 15, 14, 15, 15, 8, 15, 15, 12, 15, 15, 14, 12, 6]
let carColorsWindow = [9, 5, 9, 9, 15, 9, 1, 9, 9, 1, 9, 9, 9, 15, 1, 1, 8, 1]
let carColorsLight = [5, 4, 1, 5, 4, 5, 5, 5, 5, 5, 5, 5, 4, 2, 4, 1, 2, 5]

let currentCar = 0

function carDefaultColor(car: number, part: number): number {
    if (part == PART_BODY) { return carColorsBody[car] }
    if (part == PART_STRIPE) { return carColorsStripe[car] }
    if (part == PART_WHEEL) { return carColorsWheel[car] }
    if (part == PART_WINDOW) { return carColorsWindow[car] }
    return carColorsLight[car]
}

function mySpecial(): number {
    return carSpecial[currentCar]
}

// SUPER EZHAN X counts as every special at once
function hasSpecial(sp: number): boolean {
    let s = mySpecial()
    return s == sp || s == SP_SUPER
}

function starBar(value: number, lo: number, hi: number): string {
    let n = Math.round(1 + 4 * (value - lo) / (hi - lo))
    n = Math.max(1, Math.min(5, n))
    let out = ""
    let i = 0
    while (i < 5) {
        out = out + (i < n ? "#" : ".")
        i += 1
    }
    return out
}

function carStatsText(c: number): string {
    return carNames[c] + "\n" +
        "Special: " + specialNames[carSpecial[c]] + "\n" +
        "Speed  " + starBar(carTop[c], 74, 112) + "\n" +
        "Accel  " + starBar(carAccel[c], 2.2, 3.6) + "\n" +
        "Turn   " + starBar(carTurn[c], 4, 7.5) + "\n" +
        "Grip   " + starBar(carGrip[c], 0.08, 0.26) + "\n" +
        "Armor  " + starBar(carHp[c], 80, 220) + "\n" +
        "Ammo   " + carAmmo[c] + "\n\n" + specialHelp(carSpecial[c])
}

function specialHelp(sp: number): string {
    if (sp == SP_MISSILE) { return "DOWN fires missiles in ALL directions!" }
    if (sp == SP_JET) { return "Ramps make you fly 2x longer. B+DOWN = jet hop." }
    if (sp == SP_ROCKET) { return "Hold UP to ROCKET FLY over everything." }
    if (sp == SP_SLIME) { return "DOWN drops slime bombs. Slime never slows you." }
    if (sp == SP_TANK) { return "Huge armor. DOWN fires a big crunch cannon." }
    if (sp == SP_HOVER) { return "Floats over slime, ice and lava." }
    if (sp == SP_SUPER) { return "Missile storm + jet + rocket + slime + hover. ALL OF IT!" }
    return "A solid all-rounder. Easy to drive."
}

function selectCar(c: number) {
    currentCar = c
    let i = 0
    while (i < NUM_PARTS) {
        partColor[i] = carDefaultColor(c, i)
        i += 1
    }
    missileAmmo = Math.max(missileAmmo, carAmmo[c] + upgradeLevel[UP_MISSILE] * 2)
    saveCarAndPaint()
    rebuildPlayerImages()
    applyStats()
}

function openGarage(done: () => void) {
    let items: string[] = []
    items.push("PAINT MAKER (live preview)")
    items.push("Factory colors")
    let c = 0
    while (c < NUM_CARS) {
        let tag = c == currentCar ? " <" : ""
        if (!carUnlocked(c)) { tag = " (LOCKED: " + bonusCarKeys(c) + " keys)" }
        items.push(carNames[c] + " [" + specialNames[carSpecial[c]] + "]" + tag)
        c += 1
    }
    showMenu("GARAGE - " + NUM_CARS + " cars", items, function (pick: number) {
        if (pick == 0) {
            openPaintMaker(function () { openGarage(done) })
        } else if (pick == 1) {
            selectCar(currentCar)
            popupText("FACTORY PAINT", 5)
            openGarage(done)
        } else {
            let car = pick - 2
            if (!carUnlocked(car)) {
                if (!tryUnlockBonusCar(car)) {
                    errorSound()
                    game.showLongText("This BONUS car needs " + bonusCarKeys(car) + " golden keys. You have " + keysHeld + ". Find keys on the tracks!", DialogLayout.Center)
                    openGarage(done)
                    return
                }
            }
            game.showLongText(carStatsText(car), DialogLayout.Full)
            selectCar(car)
            buySound()
            popupText(carNames[car] + "!", 5)
            openGarage(done)
        }
    }, done)
}
