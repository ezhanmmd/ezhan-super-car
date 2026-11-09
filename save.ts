// save.ts - saving with the "settings" blocks so things stay after you turn it off
// Saved: sound, difficulty, laps, screen shake, your car, your paint colors,
// your upgrades and all the best lap / race times (laptimer.ts).

let soundOn = true
let difficulty = 1        // 1..10
let lapSetting = 3        // laps per race (1..9)
let shakeOn = true
let showGuide = true

function readSave(key: string, def: number): number {
    if (settings.exists(key)) {
        return settings.readNumber(key)
    }
    return def
}

function writeSave(key: string, value: number) {
    settings.writeNumber(key, value)
}

function saveSettings() {
    writeSave("se_sound", soundOn ? 1 : 0)
    writeSave("se_diff", difficulty)
    writeSave("se_laps", lapSetting)
    writeSave("se_shake", shakeOn ? 1 : 0)
    writeSave("se_guide", showGuide ? 1 : 0)
}

function loadSettings() {
    soundOn = readSave("se_sound", 1) == 1
    difficulty = readSave("se_diff", 1)
    lapSetting = readSave("se_laps", 3)
    shakeOn = readSave("se_shake", 1) == 1
    showGuide = readSave("se_guide", 1) == 1
}

function saveCarAndPaint() {
    writeSave("se_car", currentCar)
    let i = 0
    while (i < NUM_PARTS) {
        writeSave("se_paint" + i, partColor[i])
        i += 1
    }
}

function loadCarAndPaint() {
    currentCar = readSave("se_car", 0)
    if (currentCar >= NUM_CARS) { currentCar = 0 }
    let i = 0
    while (i < NUM_PARTS) {
        partColor[i] = readSave("se_paint" + i, carDefaultColor(currentCar, i))
        i += 1
    }
}

function saveUpgrades() {
    let i = 0
    while (i < NUM_UPGRADES) {
        writeSave("se_up" + i, upgradeLevel[i])
        i += 1
    }
}

function loadUpgrades() {
    let i = 0
    while (i < NUM_UPGRADES) {
        upgradeLevel[i] = readSave("se_up" + i, 0)
        i += 1
    }
}

function wipeEverything() {
    settings.clear()
    loadSettings()
}

// little helper so screen shake can be switched off in settings
function shake(power: number, ms: number) {
    if (shakeOn) {
        scene.cameraShake(power, ms)
    }
}
