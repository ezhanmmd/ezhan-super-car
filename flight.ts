// flight.ts - NITRO, JET RAMPS and ROCKET FLYING.
// Jet ramps launch you into the air (bigger car + shadow). Rocket cars hold UP
// to fly. While flying you skip slime, lava and crashes.
let nitro = 100
let nitroMax = 100
let nitroActive = false
let rocketFuel = 100
let rocketFuelMax = 100
let rocketOn = false
let flyUntil = 0
let flyStart = 0
let airTimeTotal = 0
let wasFlying = false
let shadowSprite: Sprite = null
let rocketMode = false       // Rocket Rally: every car is a rocket car

function canRocket(): boolean { return rocketMode || hasSpecial(SP_ROCKET) }

function nitroBonus(): number {
    nitroActive = false
    if (canRocket()) { return 0 }
    if (controller.up.isPressed() && nitro > 0 && canDrive()) {
        nitroActive = true
        nitro -= 1.2
        if (Math.floor(game.runtime() / 60) % 2 == 0) {
            let rad = heading * Math.PI / 180
            particle(player.x - Math.cos(rad) * 8, player.y - Math.sin(rad) * 8, 9, 0, 0, 200)
        }
        return 45
    }
    return 0
}

function rocketBonus(drive: boolean): number {
    rocketOn = false
    if (!canRocket()) { return 0 }
    if (drive && controller.up.isPressed() && rocketFuel > 0) {
        rocketOn = true
        rocketFuel -= 0.8
        flyUntil = Math.max(flyUntil, game.runtime() + 150)
        if (!wasFlying) { flyStart = game.runtime() }
        if (Math.floor(game.runtime() / 120) % 3 == 0) { rocketHumSound() }
        let rad = heading * Math.PI / 180
        particle(player.x - Math.cos(rad) * 9, player.y - Math.sin(rad) * 9, 4, 0 - Math.cos(rad) * 40, 0 - Math.sin(rad) * 40, 200)
        return 50
    }
    rocketFuel = Math.min(rocketFuelMax, rocketFuel + 0.15)
    return 0
}

function refillNitroFromDrift(amount: number) {
    nitro = Math.min(nitroMax, nitro + amount)
}

function isFlying(): boolean { return game.runtime() < flyUntil }

function startFlight(ms: number) {
    if (isFlying()) { return }
    flyStart = game.runtime()
    flyUntil = game.runtime() + ms
    jetRoarSound()
    sparks(player.x, player.y, 5, 8, 50)
    popupText("JET JUMP!", 5)
}

// jet hop: B + DOWN on jet cars, costs nitro
function jetHop() {
    if (!hasSpecial(SP_JET) || nitro < 25) {
        errorSound()
        return
    }
    nitro -= 25
    startFlight(600)
}

// every frame: grow the car while flying, show the shadow, crunch on landing
function updateFlight() {
    let flying = isFlying()
    if (flying) {
        if (!shadowSprite) {
            shadowSprite = sprites.create(shadowImage(10), SpriteKind.Shadow)
            shadowSprite.z = 3
            shadowSprite.setFlag(SpriteFlag.Ghost, true)
        }
        let h = Math.min(8, (game.runtime() - flyStart) / 60)
        shadowSprite.setPosition(player.x + h / 2, player.y + 4 + h / 2)
        player.scale = 1.3
        player.z = 25
    } else if (wasFlying) {
        player.scale = 1
        player.z = 10
        if (shadowSprite) {
            shadowSprite.destroy()
            shadowSprite = null
        }
        let air = game.runtime() - flyStart
        airTimeTotal += air
        jetJumpScore += Math.floor(air / 10)
        landingSound()
        shake(2, 100)
        sparks(player.x, player.y, 13, 6, 40)
    }
    wasFlying = flying
}

function drawFuelBars(x: number, y: number) {
    screen.drawRect(x, y, 32, 3, 1)
    screen.fillRect(x + 1, y + 1, Math.floor(30 * nitro / Math.max(1, nitroMax)), 1, nitroActive ? 5 : 9)
    if (canRocket()) {
        screen.drawRect(x, y + 4, 32, 3, 1)
        screen.fillRect(x + 1, y + 5, Math.floor(30 * rocketFuel / Math.max(1, rocketFuelMax)), 1, 4)
    }
}
