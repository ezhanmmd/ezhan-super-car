// agents.ts - AGENTS & BOTS: helper bots you take into races for perks.
// Equip as many as you like in the "Agents & Bots" menu (saved).
const BOT_CODE = 0       // Code & GitHub: auto-turret that shoots faster
const BOT_GURLAG = 1     // gurlagventv: missile drone that flies with you
const BOT_SITE = 2       // Site Maker: builds boost pads... gives nitro refills
const BOT_PC = 3         // PC Agent: auto-steer assist
const BOT_REMI = 4       // Remi: shield bot
const NUM_BOTS = 5
let botNames = ["Code & GitHub", "gurlagventv", "Site Maker", "PC Agent", "Remi"]
let botPerks = ["auto-turret (fast)", "missile drone", "nitro refill", "auto-steer assist", "shield bot"]
let botOn = [false, false, false, false, false]
let lastBotNitro = 0
let lastDroneMissile = 0

function botEquipped(b: number): boolean { return botOn[b] }

function loadBots() {
    let i = 0
    while (i < NUM_BOTS) {
        botOn[i] = readSave("se_bot" + i, 0) == 1
        i += 1
    }
}

function openAgentsMenu(done: () => void) {
    let items: string[] = []
    let i = 0
    while (i < NUM_BOTS) {
        items.push((botOn[i] ? "[ON]  " : "[off] ") + botNames[i] + " - " + botPerks[i])
        i += 1
    }
    items.push("All bots ON")
    items.push("All bots off")
    showMenu("AGENTS & BOTS", items, function (pick: number) {
        let k = 0
        while (k < NUM_BOTS) {
            if (pick == k) { botOn[k] = !botOn[k] }
            if (pick == NUM_BOTS) { botOn[k] = true }
            if (pick == NUM_BOTS + 1) { botOn[k] = false }
            writeSave("se_bot" + k, botOn[k] ? 1 : 0)
            k += 1
        }
        popSound()
        refreshRobots()
        openAgentsMenu(done)
    }, done)
}

// bot perks that run every frame in a race
function updateBots() {
    let now = game.runtime()
    if (botOn[BOT_SITE] && now - lastBotNitro > 8000) {
        lastBotNitro = now
        nitro = nitroMax
        popupText("Site Maker: NITRO!", 9)
    }
    if (botOn[BOT_GURLAG] && drone && now - lastDroneMissile > 3000) {
        let t = closestEnemy(drone, 80)
        if (t) {
            lastDroneMissile = now
            launchMissile(drone.x, drone.y, Math.atan2(t.y - drone.y, t.x - drone.x) * 180 / Math.PI, 140, false)
        }
    }
}

// PC Agent nudges your steering toward the next checkpoint
function steerAssist(): number {
    if (!botOn[BOT_PC] || !player) { return 0 }
    let want = Math.atan2(wayY[playerWp] - player.y, wayX[playerWp] - player.x) * 180 / Math.PI
    let diff = want - heading
    while (diff > 180) { diff -= 360 }
    while (diff < -180) { diff += 360 }
    return Math.max(-2, Math.min(2, diff * 0.1))
}
