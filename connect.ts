// connect.ts - the CONNECT menu: WiFi / Bluetooth / Car.
// IMPORTANT: MakeCode Arcade can NOT use real WiFi or Bluetooth. Everything
// here is PRETEND: made-up names, a fake scanning radar and in-game bonuses.
// You can add your own pretend names (names only - no passwords!).
// F5 REFRESH: press MENU on the scan screen (or pick "F5 Refresh") to rescan.

let wifiNames = ["TurboNet-5G", "SlimeLink-Mesh", "RocketFi-Pro", "JetStream-Air", "MissileZone-6"]
let btNames = ["NitroPod BT", "RoboBuddy BT", "SquishSpeaker BT", "CrunchBuds BT"]
let carNetNames = ["RoboCar-X", "Ghost Racer 9", "Slime Kart Z", "Jet Buggy 3000"]
let connectKind = 0          // 0 wifi, 1 bluetooth, 2 car
let connectKindNames = ["WiFi", "Bluetooth", "Car"]
let scanUntil = 0
let scanDone: () => void = null
let connectedTo = "nothing"
let connectNitroBonus = 0

function customName(kind: number, i: number): string {
    let key = "se_cn" + kind + "_" + i
    if (settings.exists(key)) { return settings.readString(key) }
    return ""
}

function customCount(kind: number): number { return readSave("se_cncount" + kind, 0) }

function addCustomName(kind: number) {
    let n = game.askForString("Name your pretend " + connectKindNames[kind], 12)
    if (n && n.length > 0) {
        let c = customCount(kind)
        settings.writeString("se_cn" + kind + "_" + c, n)
        writeSave("se_cncount" + kind, c + 1)
        popSound()
    }
}

function scanList(kind: number): string[] {
    let base = kind == 0 ? wifiNames : (kind == 1 ? btNames : carNetNames)
    let out: string[] = []
    let i = 0
    while (i < base.length) { out.push(base[i]); i += 1 }
    let k = 0
    while (k < customCount(kind)) {
        out.push(customName(kind, k) + " (yours)")
        k += 1
    }
    return out
}

// radar animation for 2 seconds, then show the list
function startScan(kind: number, done: () => void) {
    connectKind = kind
    scanDone = done
    scanUntil = game.runtime() + 2000
    gameState = STATE_CONNECT
    zapSound()
}

function drawScan() {
    screen.fill(15)
    let t = game.runtime()
    let a = t / 200
    screen.drawCircle(80, 64, 40, 7)
    screen.drawCircle(80, 64, 26, 7)
    screen.drawCircle(80, 64, 12, 7)
    screen.drawLine(80, 64, 80 + Math.cos(a) * 40, 64 + Math.sin(a) * 40, 5)
    let found = Math.min(scanList(connectKind).length, Math.floor((2000 - (scanUntil - t)) / 300))
    let i = 0
    while (i < found) {
        screen.fillRect(80 + Math.cos(i * 1.7) * (14 + i * 4), 64 + Math.sin(i * 1.7) * (14 + i * 4), 2, 2, 5)
        i += 1
    }
    screen.print("Scanning " + connectKindNames[connectKind] + "... (pretend)", 4, 4, 1, image.font5)
    screen.print("found " + found, 4, 112, 7, image.font5)
    if (t > scanUntil) {
        gameState = STATE_MENU
        let d = scanDone
        scanDone = null
        if (d) { control.runInParallel(d) }
    }
}

function connectBonus(name: string, kind: number, idx: number) {
    connectedTo = name
    let b = idx % 5
    if (b == 0) { connectNitroBonus = 40; popupText("+40 NITRO TANK", 9) }
    else if (b == 1) { slimeBombs += 10; popupText("+10 SLIME BOMBS", 7) }
    else if (b == 2) { rocketFuel = 999; popupText("ROCKET FUEL FULL", 4) }
    else if (b == 3) { stormCharges += 5; popupText("+5 MISSILE STORMS", 2) }
    else { earnCoins(50000); popupText("+$50,000", 5) }
    if (kind == 2) { missileAmmo += 20 }
    applyStats()
    bigPopSound()
}

function openConnectList(kind: number, done: () => void) {
    let list = scanList(kind)
    let items: string[] = []
    let i = 0
    while (i < list.length) { items.push(list[i]); i += 1 }
    items.push("F5 Refresh (rescan)")
    items.push("+ Add name")
    showMenu(connectKindNames[kind] + " - connected: " + connectedTo, items, function (pick: number) {
        if (pick < list.length) {
            game.splash("Connecting to", list[pick])
            connectBonus(list[pick], kind, pick)
            openConnectList(kind, done)
        } else if (pick == list.length) {
            startScan(kind, function () { openConnectList(kind, done) })
        } else {
            addCustomName(kind)
            startScan(kind, function () { openConnectList(kind, done) })
        }
    }, done)
}

function openConnect(done: () => void) {
    showMenu("CONNECT (pretend, game only)", ["WiFi", "Bluetooth", "Car", "F5 Refresh all"], function (pick: number) {
        if (pick < 3) {
            startScan(pick, function () { openConnectList(pick, function () { openConnect(done) }) })
        } else {
            startScan(randint(0, 2), function () { openConnect(done) })
        }
    }, done)
}

// main menu "+ Add name": pick WiFi / Bluetooth / Car, type a name, see the list
function openAddNameMenu(done: () => void) {
    showMenu("+ ADD NAME (pretend)", ["+ WiFi name", "+ Bluetooth name", "+ Car name"], function (pick: number) {
        addCustomName(pick)
        startScan(pick, function () { openConnectList(pick, done) })
    }, done)
}

// main menu "F5 Refresh": rescan WiFi, then Bluetooth, then Car
function refreshAll(done: () => void) {
    startScan(0, function () {
        startScan(1, function () {
            startScan(2, function () {
                popupText("F5: all rescanned", 7)
                done()
            })
        })
    })
}
