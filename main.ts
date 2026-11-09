// SUPER EZHAN CAR - Ezhan's own MakeCode Arcade racer
// Controls: A gas | B brake (B + turn fast = DRIFT) | LEFT/RIGHT steer
//           UP = nitro (rocket cars: ROCKET FLY) | DOWN = fire (missile car: ALL directions)
//           B + DOWN = jet hop (jet cars) or horn | MENU = pause (shop, garage...)
// See README.md for a map of all the files.

scene.setBackgroundColor(15)
loadSettings()
initShop()
initTracks()
loadUpgrades()
loadKeys()
loadBots()
loadCarAndPaint()
if (secretTrackOpen()) { trackUnlocked[SECRET_TRACK] = true }
setupCollisions()
setupHud()
paintButtons()
loadTrack(0)

function backToMenu() {
    stopMusic()
    clearPickups()
    removeBoss()
    clearRivals()
    rocketMode = false
    if (player) { player.setVelocity(0, 0) }
    gameState = STATE_MENU
    startMenuMusic()
    showMainMenu()
}

function showMainMenu() {
    gameState = STATE_MENU
    let items = [
        "Race: " + trackNames[selectedTrack],
        "Super Grand Prix (6 races)",
        "Endless Repeat (forever!)",
        "Time Trial",
        "BOSS: Mega Jet King",
        "Missile Mayhem Arena",
        "Rocket Rally (everyone flies)",
        "Slime Survival",
        "Jet Jump Challenge",
        "Drift King",
        "Pick Track (" + trackNames.length + ")",
        "Garage + Paint Maker",
        "Upgrades",
        "Mega Shop (" + withCommas(totalShopItems()) + ")",
        "Agents & Bots",
        "Key Vault (" + keysHeld + " keys)",
        "Connect (WiFi/BT/Car)",
        "Weather",
        "Best Times",
        "Settings",
        "How to play"
    ]
    showMenu("SUPER EZHAN @" + username, items, function (pick: number) {
        stopMusic()
        if (pick == 0) { startRace(MODE_RACE, selectedTrack) }
        else if (pick == 1) { startGrandPrix() }
        else if (pick == 2) { startEndless() }
        else if (pick == 3) { startRace(MODE_TIME_TRIAL, selectedTrack) }
        else if (pick == 4) { startRace(MODE_BOSS, BOSS_TRACK) }
        else if (pick == 5) { startRace(MODE_MISSILE_MAYHEM, ARENA_TRACK) }
        else if (pick == 6) { startRace(MODE_ROCKET_RALLY, selectedTrack) }
        else if (pick == 7) { startRace(MODE_SLIME_SURVIVAL, ARENA_TRACK) }
        else if (pick == 8) { startRace(MODE_JET_JUMP, 2) }
        else if (pick == 9) { startRace(MODE_DRIFT_KING, selectedTrack) }
        else if (pick == 10) { openTrackMenu(showMainMenu) }
        else if (pick == 11) { openGarage(showMainMenu) }
        else if (pick == 12) { openUpgrades(showMainMenu) }
        else if (pick == 13) { openShop(showMainMenu) }
        else if (pick == 14) { openAgentsMenu(showMainMenu) }
        else if (pick == 15) { openKeyVault(showMainMenu) }
        else if (pick == 16) { openConnect(showMainMenu) }
        else if (pick == 17) { openWeatherMenu(showMainMenu) }
        else if (pick == 18) { showRecords(showMainMenu) }
        else if (pick == 19) { openSettings(showMainMenu) }
        else { showHelp(); showMainMenu() }
    }, showMainMenu)
}

function openTrackMenu(done: () => void) {
    let items: string[] = []
    let i = 0
    while (i < trackNames.length) {
        let tag = ""
        if (!trackUnlocked[i]) { tag = i == SECRET_TRACK ? " (10 keys)" : " (buy $3000)" }
        if (hasBranch(i)) { tag = tag + (brType[i] == 2 ? " [gate]" : " [shortcut]") }
        if (i == selectedTrack) { tag = tag + " <" }
        items.push(trackNames[i] + tag)
        i += 1
    }
    showMenu("TRACKS", items, function (pick: number) {
        if (!trackUnlocked[pick]) {
            if (pick == SECRET_TRACK) {
                errorSound()
                done()
                return
            }
            spendCoins(3000)
            trackUnlocked[pick] = true
            buySound()
        }
        selectedTrack = pick
        loadTrack(pick)
        popSound()
        done()
    }, done)
}

function openSettings(done: () => void) {
    let items = ["Sound: " + (soundOn ? "ON" : "OFF"), "Difficulty: " + difficulty, "Laps: " + lapSetting, "Screen shake: " + (shakeOn ? "ON" : "OFF"), "Guide arrow: " + (showGuide ? "ON" : "OFF"), "Reset best times", "Unlock all normal tracks", "Log out (" + username + ")"]
    showMenu("SETTINGS (saved)", items, function (pick: number) {
        if (pick == 0) { soundOn = !soundOn; if (!soundOn) { stopMusic() } }
        else if (pick == 1) { difficulty = difficulty % 10 + 1 }
        else if (pick == 2) { lapSetting = lapSetting % 9 + 1 }
        else if (pick == 3) { shakeOn = !shakeOn }
        else if (pick == 4) { showGuide = !showGuide }
        else if (pick == 5) { resetRecords(); popupText("Records cleared", 2) }
        else if (pick == 6) {
            let i = 0
            while (i <= ARENA_TRACK) { trackUnlocked[i] = true; i += 1 }
        } else { username = "Guest" }
        saveSettings()
        openSettings(done)
    }, done)
}

function showHelp() {
    game.showLongText("A = gas  B = brake\nB + turn fast = DRIFT\nUP = nitro / rocket fly\nDOWN = fire missile\n(missile cars shoot ALL ways)\nB + DOWN = jet hop / horn\nMENU = pause\n\nJet ramps make you FLY. Slime is squishy! Find golden keys to open secret gates and bonus cars. Shortcuts skip part of the track.", DialogLayout.Full)
}

function openPauseMenu() {
    gameState = STATE_PAUSED
    player.setVelocity(0, 0)
    freezeRivals()
    if (boss) { boss.setVelocity(0, 0) }
    let pausedAt = game.runtime()
    let resume = function () {
        let lost = game.runtime() - pausedAt
        lapStart += lost
        raceStartTime += lost
        countdownEnd += lost
        modeEndAt += lost
        gameState = STATE_RACING
    }
    showMenu("PAUSED", ["Resume", "Shop", "Garage", "Agents & Bots", "Restart", "Quit to menu"], function (pick: number) {
        if (pick == 0) { resume() }
        else if (pick == 1) { openShop(resume) }
        else if (pick == 2) { openGarage(resume) }
        else if (pick == 3) { openAgentsMenu(resume) }
        else if (pick == 4) { startRace(currentMode, trackId) }
        else { backToMenu() }
    }, resume)
}

// ---------- buttons ----------
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == STATE_TITLE) {
        gameState = STATE_MENU
        control.runInParallel(function () {
            loginScreen()
            startMenuMusic()
            showMainMenu()
        })
    }
})

controller.menu.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState == STATE_RACING && !raceOver && !menuOpen) {
        openPauseMenu()
    } else if (gameState == STATE_CONNECT) {
        // F5 REFRESH: rescan
        scanUntil = game.runtime() + 2000
        zapSound()
    }
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameState != STATE_RACING || menuOpen || !canDrive()) { return }
    if (controller.B.isPressed()) {
        if (hasSpecial(SP_JET)) { jetHop() } else { honk() }
    } else {
        fireWeapon()
    }
})

// ---------- game loop ----------
game.onUpdate(function () {
    if (gameState == STATE_RACING) {
        updateRace()
    } else if (player) {
        player.setVelocity(0, 0)
        freezeRivals()
        if (boss) { boss.setVelocity(0, 0) }
    }
})

game.onUpdateInterval(120, function () {
    if (gameState == STATE_RACING && canDrive()) {
        engineSound(Math.abs(speed), nitroActive || rocketOn ? 120 : 0)
    }
})

forever(function () {
    if (gameState == STATE_RESULTS && raceOver) {
        showResults()
    }
    pause(100)
})

// ---------- ENDLESS REPEAT: the big repeat block ----------
// 1e150 means 1 followed by 150 zeros:
// 1,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,
// 000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,
// 000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,
// 000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000
// It is inside forever() so even when it finishes (it never will!) it starts again.
forever(function () {
    for (let index = 0; index < 1e150; index++) {
        endlessTick()
        pause(200)
    }
})

// ---------- start! ----------
createPlayer()
player.setFlag(SpriteFlag.Invisible, true)
gameState = STATE_TITLE
