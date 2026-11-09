// sounds.ts - all the SATISFYING sounds: pop, squish, crunch, jets, rockets,
// missiles, engine, horns and music. Every sound checks soundOn first.

let lastEngineTone = 0
let lastSquishAt = 0
let lastPopAt = 0
let lastCrunchAt = 0
let lastScreechAt = 0
let lastJetAt = 0
let musicPlaying = false

function fx(wave: WaveShape, f0: number, f1: number, vol: number, ms: number, effect: SoundExpressionEffect, curve: InterpolationCurve) {
    if (soundOn) {
        music.play(music.createSoundEffect(wave, f0, f1, vol, 0, ms, effect, curve), music.PlaybackMode.InBackground)
    }
}

function melody(m: music.Melody) {
    if (soundOn) {
        music.play(music.melodyPlayable(m), music.PlaybackMode.InBackground)
    }
}

function notes(n: string, tempo: number) {
    if (soundOn) {
        music.play(music.stringPlayable(n, tempo), music.PlaybackMode.InBackground)
    }
}

// ---------- the satisfying three ----------
// POP: a quick bubbly "plip" going UP (coins, bubbles, buying)
function popSound() {
    if (game.runtime() - lastPopAt < 60) { return }
    lastPopAt = game.runtime()
    fx(WaveShape.Sine, 500, 1700, 200, 70, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

// a double pop for bigger rewards
function bigPopSound() {
    fx(WaveShape.Sine, 400, 1400, 220, 60, SoundExpressionEffect.None, InterpolationCurve.Curve)
    fx(WaveShape.Triangle, 900, 2400, 160, 120, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

// SQUISH: wobbly slide DOWN with vibrato (slime!)
function squishSound() {
    if (game.runtime() - lastSquishAt < 180) { return }
    lastSquishAt = game.runtime()
    fx(WaveShape.Triangle, 420, 90, 230, 260, SoundExpressionEffect.Vibrato, InterpolationCurve.Curve)
    fx(WaveShape.Noise, 300, 100, 60, 160, SoundExpressionEffect.None, InterpolationCurve.Linear)
}

// SPLAT: wetter, louder squish for slime bombs
function splatSound() {
    fx(WaveShape.Noise, 900, 60, 255, 220, SoundExpressionEffect.Warble, InterpolationCurve.Curve)
    fx(WaveShape.Sine, 300, 60, 200, 200, SoundExpressionEffect.Vibrato, InterpolationCurve.Curve)
}

// CRUNCH: crispy noise + low thud (crashes, landings, wrecks)
function crunchSound() {
    if (game.runtime() - lastCrunchAt < 120) { return }
    lastCrunchAt = game.runtime()
    fx(WaveShape.Noise, 1200, 80, 255, 180, SoundExpressionEffect.Tremolo, InterpolationCurve.Linear)
    fx(WaveShape.Square, 140, 40, 200, 160, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

function megaCrunchSound() {
    melody(music.bigCrash)
    fx(WaveShape.Noise, 600, 30, 255, 600, SoundExpressionEffect.Tremolo, InterpolationCurve.Curve)
}

// ---------- vehicles ----------
function jetRoarSound() {
    if (game.runtime() - lastJetAt < 300) { return }
    lastJetAt = game.runtime()
    fx(WaveShape.Noise, 200, 2600, 200, 500, SoundExpressionEffect.None, InterpolationCurve.Curve)
    fx(WaveShape.Sawtooth, 180, 520, 90, 500, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear)
}

function rocketSound() {
    fx(WaveShape.Noise, 120, 1800, 255, 700, SoundExpressionEffect.Warble, InterpolationCurve.Curve)
}

function rocketHumSound() {
    fx(WaveShape.Noise, 300, 340, 80, 120, SoundExpressionEffect.None, InterpolationCurve.Linear)
}

function landingSound() {
    crunchSound()
    fx(WaveShape.Sine, 200, 50, 220, 200, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

function nitroSound() {
    fx(WaveShape.Noise, 200, 2000, 255, 600, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

function boostPadSound() {
    fx(WaveShape.Square, 400, 1600, 150, 250, SoundExpressionEffect.None, InterpolationCurve.Linear)
}

function engineSound(speedAbs: number, extra: number) {
    if (speedAbs < 3) { return }
    let tone = 60 + Math.floor(speedAbs * 2.4) + extra
    if (Math.abs(tone - lastEngineTone) > 2) {
        lastEngineTone = tone
        fx(WaveShape.Square, tone, tone + 12, 35, 90, SoundExpressionEffect.None, InterpolationCurve.Linear)
    }
}

function screechSound() {
    if (game.runtime() - lastScreechAt < 250) { return }
    lastScreechAt = game.runtime()
    fx(WaveShape.Sawtooth, 1500, 1100, 55, 200, SoundExpressionEffect.Vibrato, InterpolationCurve.Linear)
}

// ---------- weapons ----------
function missileLaunchSound() {
    fx(WaveShape.Sawtooth, 1800, 300, 140, 220, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

function missileStormSound() {
    fx(WaveShape.Noise, 3000, 200, 255, 400, SoundExpressionEffect.Warble, InterpolationCurve.Curve)
    fx(WaveShape.Sawtooth, 2000, 200, 160, 400, SoundExpressionEffect.None, InterpolationCurve.Curve)
}

function boomSound() {
    melody(music.thump)
    crunchSound()
}

function zapSound() { melody(music.zapped) }
function shieldSound() { melody(music.magicWand) }

// ---------- menus + rewards ----------
function coinSound() { popSound() }
function buySound() { bigPopSound() }
function menuMoveSound() {
    if (soundOn) { music.playTone(988, 15) }
}
function menuPickSound() { notes("C5 E5 G5 ", 700) }
function errorSound() { melody(music.buzzer) }
function lapSound() { notes("G5 C6 ", 500) }
function recordSound() { notes("E5 G5 E6 C6 D6 G6 ", 420) }
function winFanfare() { notes("C5 E5 G5 C6 - G5 C6 - - ", 300) }
function loseSound() { notes("G4 F4 E4 D4 C4 - - ", 220) }
function bossIntroSound() { notes("C3 C3 - C3 D#3 - G3 F3 - D#3 C3 - - ", 230) }
function thunderSound() {
    fx(WaveShape.Noise, 120, 30, 255, 900, SoundExpressionEffect.None, InterpolationCurve.Curve)
}
function countdownBeep(n: number) {
    if (!soundOn) { return }
    if (n > 0) {
        music.playTone(440, 150)
    } else {
        music.playTone(880, 400)
    }
}

// ---------- 120 generated horns: style (12) x pitch (10) ----------
let hornScale = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698, 784, 880]
let hornStyles = ["Beep", "Toot", "Honk", "Blare", "Siren", "Chime", "Trumpet", "Jet", "Rocket", "Robo", "Squish", "Pop"]

function hornName(id: number): string {
    return hornStyles[id % 12] + " " + (Math.floor(id / 12) + 1)
}

function playHorn(id: number) {
    if (!soundOn) { return }
    let style = id % 12
    let pitch = Math.floor(id / 12)
    if (style == 7) {
        fx(WaveShape.Noise, 300 + pitch * 50, 2400, 200, 300, SoundExpressionEffect.None, InterpolationCurve.Curve)
        return
    }
    if (style == 8) {
        rocketSound()
        return
    }
    if (style == 10) {
        fx(WaveShape.Triangle, 500 + pitch * 30, 90, 230, 260, SoundExpressionEffect.Vibrato, InterpolationCurve.Curve)
        return
    }
    if (style == 11) {
        fx(WaveShape.Sine, 400 + pitch * 40, 1800 + pitch * 60, 220, 80, SoundExpressionEffect.None, InterpolationCurve.Curve)
        return
    }
    let count = 2 + (id % 3)
    let i = 0
    while (i < count) {
        let f = hornScale[(pitch + i * (style + 1)) % hornScale.length]
        if (style == 4) { f = (i % 2 == 0) ? 620 : 920 }
        if (style == 9) { f = f * 2 }
        if (style == 2) { f = Math.floor(f / 2) }
        music.playTone(f, 60 + (style % 3) * 30)
        i += 1
    }
}

function defaultHorn() {
    if (soundOn) {
        music.playTone(330, 100)
        music.playTone(262, 150)
    }
}

// ---------- music ----------
function startMenuMusic() {
    if (!musicPlaying && soundOn) {
        musicPlaying = true
        music.play(music.stringPlayable("C5 G4 A4 E4 F4 C4 F4 G4 ", 150), music.PlaybackMode.LoopingInBackground)
    }
}

function stopMusic() {
    music.stopAllSounds()
    musicPlaying = false
}
