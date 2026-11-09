// modes.ts - 10 modes: Race, Super Grand Prix, Endless Repeat, Time Trial,
// Boss, Missile Mayhem, Rocket Rally, Slime Survival, Jet Jump, Drift King.
let selectedTrack = 0
let totalLaps = 3
let playerLap = 0
let playerWp = 1
let countdownEnd = 0
let lastCountBeep = 4
let raceOver = false
let raceWon = false
let modeEndAt = 0
let gpRound = 0
let gpPoints = 0
let gpTracks = [0, 1, 2, 3, 5, 7]
let pointsTable = [15, 12, 10, 8, 6, 5, 4, 3, 2, 1, 0]
let endlessRound = 0
let endlessNeedsNext = false
let jetJumpScore = 0
let driftScore = 0

function canDrive(): boolean {
    return gameState == STATE_RACING && game.runtime() >= countdownEnd && !raceOver && wreckedAt == 0
}

function playerProgress(): number {
    if (!player) { return 0 }
    return playerLap * 100 + playerWp * 5 - Math.min(4, distToWp(player, playerWp) / 10)
}

function startRace(mode: number, t: number) {
    currentMode = mode
    clearPickups()
    removeBoss()
    clearRivals()
    rivalChase = false
    rocketMode = mode == MODE_ROCKET_RALLY
    // only a normal Race / Time Trial etc. needs the track to be unlocked;
    // Boss, Arena, Grand Prix and Endless always use their own tracks
    if (!trackUnlocked[t] && t < NUM_RACE_TRACKS && (mode == MODE_RACE || mode == MODE_TIME_TRIAL || mode == MODE_ROCKET_RALLY || mode == MODE_DRIFT_KING)) { t = 0 }
    if (t == SECRET_TRACK && !trackUnlocked[t]) { t = 0 }
    loadTrack(t)
    pickWeather()
    if (mode == MODE_SLIME_SURVIVAL) { weather = 8 }
    totalLaps = lapSetting
    if (mode == MODE_BOSS) { totalLaps = Math.max(3, lapSetting) }
    playerLap = 0
    playerWp = 1
    raceOver = false
    raceWon = false
    jetJumpScore = 0
    driftScore = 0
    wrecksCaused = 0
    wreckedAt = 0
    if (!player) { createPlayer() }
    player.setFlag(SpriteFlag.Invisible, false)
    applyStats()
    let g = gridPos(0)
    placePlayer(g[0], g[1], startHeading)
    let count = 9
    if (mode == MODE_TIME_TRIAL || mode == MODE_JET_JUMP || mode == MODE_DRIFT_KING) { count = 0 }
    if (mode == MODE_BOSS) { count = 3 }
    if (mode == MODE_ENDLESS) { count = Math.min(MAX_RIVALS, 3 + endlessRound) }
    if (mode == MODE_MISSILE_MAYHEM) { count = 6 }
    if (mode == MODE_SLIME_SURVIVAL) { count = 4 }
    spawnRivals(count)
    if (mode == MODE_BOSS) { spawnBoss() }
    if (mode == MODE_MISSILE_MAYHEM || mode == MODE_SLIME_SURVIVAL) {
        rivalChase = true
        modeEndAt = game.runtime() + 3000 + 60000
        missileAmmo = Math.max(missileAmmo, 30)
        stormCharges = Math.max(stormCharges, 5)
    }
    refreshRobots()
    spawnKey()
    countdownEnd = game.runtime() + 3000
    lastCountBeep = 4
    startLapTimer()
    stopMusic()
    gameState = STATE_RACING
}

function updateCountdown() {
    let left = Math.ceil((countdownEnd - game.runtime()) / 1000)
    if (left < lastCountBeep && left >= 0) {
        lastCountBeep = left
        countdownBeep(left)
        if (left == 0) { startLapTimer() }
    }
}

function updateRace() {
    updateCountdown()
    if (wreckedAt > 0 && game.runtime() - wreckedAt > 1500) { respawnPlayer() }
    if (wreckedAt == 0) {
        updatePlayerPhysics(canDrive())
    } else {
        player.setVelocity(0, 0)
    }
    updateFlight()
    if (canDrive() || game.runtime() < countdownEnd) {
        if (game.runtime() >= countdownEnd) {
            updateRivals()
            updateBoss()
            updatePickups()
            updateWeather()
            updateRobots()
            updateBots()
        } else {
            freezeRivals()
        }
    }
    if (!raceOver && game.runtime() >= countdownEnd) {
        checkCheckpoints()
        checkModeEnd()
        if (slipAngle > 18) {
            driftScore += Math.floor(slipAngle / 6)
            refillNitroFromDrift(0.5)
        }
    }
}

function checkCheckpoints() {
    if (rivalChase) { return }
    // shortcut: if you are on the branch and reach its end, skip ahead
    if (hasBranch(trackId) && playerWp > brFrom[trackId] && playerWp < brTo[trackId] && distToWp(player, brTo[trackId]) < 16) {
        playerWp = brTo[trackId]
        popupText("SHORTCUT!", 5)
    }
    if (distToWp(player, playerWp) < 18 || (isFlying() && distToWp(player, playerWp) < 24)) {
        playerWp = (playerWp + 1) % NUM_WAYPOINTS
        if (playerWp == 1) {
            playerLap += 1
            finishLap()
            lapSound()
            if (playerLap >= totalLaps) {
                endRace(true)
            }
        }
    }
}

function checkModeEnd() {
    let now = game.runtime()
    if (rivalChase && now > modeEndAt) {
        endRace(true)
    }
    if (currentMode == MODE_BOSS && bossDefeated) {
        endRace(true)
    }
    if (currentMode == MODE_BOSS && bossFinished && !raceOver) {
        endRace(false)
    }
}

function endRace(finished: boolean) {
    raceOver = true
    let pos = playerPosition()
    raceWon = finished && pos == 1
    if (currentMode == MODE_BOSS) { raceWon = bossDefeated || (finished && !bossFinished) }
    if (rivalChase) { raceWon = wreckedAt == 0 }
    if (finished && !rivalChase) { finishRaceTime() }
    gameState = STATE_RESULTS
    player.setVelocity(0, 0)
    freezeRivals()
}

// the results screen (runs in its own loop because splash waits for a button)
function showResults() {
    raceOver = false
    let pos = playerPosition()
    let reward = 1000 + (raceWon ? 5000 : 0) + wrecksCaused * 300
    earnCoins(reward)
    if (raceWon) {
        winFanfare()
        confetti(25)
        difficulty = Math.min(10, difficulty + 1)
    } else {
        loseSound()
    }
    if (currentMode == MODE_JET_JUMP) { writeSave("se_jet", Math.max(readSave("se_jet", 0), jetJumpScore)) }
    if (currentMode == MODE_DRIFT_KING) { writeSave("se_drift", Math.max(readSave("se_drift", 0), driftScore)) }
    let line = rivalChase ? "Wrecks " + wrecksCaused : placeText(pos) + " " + timeText(raceMs())
    if (currentMode == MODE_ENDLESS) {
        endlessRound += 1
        writeSave("se_endless", Math.max(readSave("se_endless", 0), endlessRound))
        game.splash("REPEAT #" + endlessRound + " " + line, "+$" + reward + " next round...")
        endlessNeedsNext = true
        gameState = STATE_BETWEEN
        return
    }
    if (currentMode == MODE_GRAND_PRIX) {
        gpPoints += pointsTable[Math.min(10, pos - 1)]
        gpRound += 1
        if (gpRound < gpTracks.length) {
            game.splash("GP race " + gpRound + ": " + placeText(pos), "Points " + gpPoints)
            startRace(MODE_GRAND_PRIX, gpTracks[gpRound])
            return
        }
        game.splash("GRAND PRIX OVER!", "Total points " + gpPoints)
    } else {
        game.splash(raceWon ? "YOU WIN @" + username + "!" : "Race over", line + "  +$" + reward)
    }
    backToMenu()
}

function startGrandPrix() {
    gpRound = 0
    gpPoints = 0
    startRace(MODE_GRAND_PRIX, gpTracks[0])
}

function startEndless() {
    endlessRound = 0
    endlessNeedsNext = false
    startRace(MODE_ENDLESS, randint(0, NUM_RACE_TRACKS - 1))
}

// called by the big REPEAT block in main.ts
function endlessTick() {
    if (currentMode == MODE_ENDLESS && gameState == STATE_BETWEEN && endlessNeedsNext) {
        endlessNeedsNext = false
        difficulty = Math.min(10, 1 + Math.floor(endlessRound / 2))
        startRace(MODE_ENDLESS, randint(0, NUM_RACE_TRACKS - 1))
    }
}
