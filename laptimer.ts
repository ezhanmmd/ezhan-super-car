// laptimer.ts - lap times, race times and best times SAVED with settings
let lapStart = 0
let raceStartTime = 0
let lastLapMs = 0
let newRecordUntil = 0

function timeText(ms: number): string {
    if (ms <= 0) { return "--:--.-" }
    let tenths = Math.floor(ms / 100)
    let secs = Math.floor(tenths / 10) % 60
    let mins = Math.floor(tenths / 600)
    return mins + ":" + (secs < 10 ? "0" : "") + secs + "." + (tenths % 10)
}

function bestLap(t: number): number { return readSave("se_lap" + t, 0) }
function bestRace(t: number): number { return readSave("se_race" + t, 0) }

function startLapTimer() {
    lapStart = game.runtime()
    raceStartTime = game.runtime()
    lastLapMs = 0
}

function currentLapMs(): number { return game.runtime() - lapStart }
function raceMs(): number { return game.runtime() - raceStartTime }

function finishLap() {
    lastLapMs = currentLapMs()
    lapStart = game.runtime()
    let b = bestLap(trackId)
    if (b == 0 || lastLapMs < b) {
        writeSave("se_lap" + trackId, lastLapMs)
        newRecordUntil = game.runtime() + 2000
        recordSound()
    }
}

function finishRaceTime(): boolean {
    let t = raceMs()
    let b = bestRace(trackId)
    if (b == 0 || t < b) {
        writeSave("se_race" + trackId, t)
        return true
    }
    return false
}

function showRecords(done: () => void) {
    let text = "BEST TIMES (saved)\n"
    let i = 0
    while (i < trackNames.length) {
        if (i != ARENA_TRACK) {
            text = text + trackNames[i] + "\n lap " + timeText(bestLap(i)) + "  race " + timeText(bestRace(i)) + "\n"
        }
        i += 1
    }
    text = text + "Best endless round: " + readSave("se_endless", 0) + "\nBest jet jump: " + readSave("se_jet", 0) + "\nBest drift: " + readSave("se_drift", 0)
    game.showLongText(text, DialogLayout.Full)
    done()
}

function resetRecords() {
    let i = 0
    while (i < trackNames.length) {
        settings.remove("se_lap" + i)
        settings.remove("se_race" + i)
        i += 1
    }
}
