// hud.ts - the screen on top: speed, laps, place, timers, bars, pop-up text,
// the title screen painter and the menu helper used by every menu.
let lightColor = 0
let lightUntil = 0
let popText = ""
let popColor = 1
let popUntil = 0
let menuOpen = false

function flashLights(c: number) {
    lightColor = c
    lightUntil = game.runtime() + 300
}

function popupText(t: string, c: number) {
    popText = t
    popColor = c
    popUntil = game.runtime() + 1300
}

// one helper for every menu: A picks, B goes back
function showMenu(title: string, items: string[], onPick: (i: number) => void, onBack: () => void) {
    menuOpen = true
    let list: miniMenu.MenuItem[] = []
    let i = 0
    while (i < items.length) {
        list.push(miniMenu.createMenuItem(items[i]))
        i += 1
    }
    let m = miniMenu.createMenuFromArray(list)
    miniMenu.setTitle(m, title)
    miniMenu.setDimensions(m, 156, 108)
    miniMenu.setMenuStyleProperty(m, miniMenu.MenuStyleProperty.Border, 1)
    miniMenu.setMenuStyleProperty(m, miniMenu.MenuStyleProperty.BorderColor, 5)
    miniMenu.setMenuStyleProperty(m, miniMenu.MenuStyleProperty.BackgroundColor, 15)
    miniMenu.setStyleProperty(m, miniMenu.StyleKind.Default, miniMenu.StyleProperty.Foreground, 1)
    miniMenu.setStyleProperty(m, miniMenu.StyleKind.Default, miniMenu.StyleProperty.Background, 15)
    miniMenu.setStyleProperty(m, miniMenu.StyleKind.Selected, miniMenu.StyleProperty.Foreground, 15)
    miniMenu.setStyleProperty(m, miniMenu.StyleKind.Selected, miniMenu.StyleProperty.Background, 4)
    miniMenu.setStyleProperty(m, miniMenu.StyleKind.Title, miniMenu.StyleProperty.Foreground, 1)
    miniMenu.setStyleProperty(m, miniMenu.StyleKind.Title, miniMenu.StyleProperty.Background, 2)
    m.setPosition(80, 62)
    m.z = 1000
    m.setFlag(SpriteFlag.RelativeToCamera, true)
    miniMenu.onSelectionChanged(m, function (sel: string, idx: number) {
        menuMoveSound()
    })
    miniMenu.onButtonPressed(m, miniMenu.Button.A, function (sel: string, idx: number) {
        miniMenu.close(m)
        menuOpen = false
        control.runInParallel(function () {
            pause(120)
            onPick(idx)
        })
    })
    miniMenu.onButtonPressed(m, miniMenu.Button.B, function (sel: string, idx: number) {
        miniMenu.close(m)
        menuOpen = false
        control.runInParallel(function () {
            pause(120)
            onBack()
        })
    })
}

function drawHpBar(x: number, y: number) {
    screen.drawRect(x, y, 34, 4, 1)
    let c = hp < maxHp * 0.25 ? 2 : (hp < maxHp * 0.5 ? 5 : 7)
    screen.fillRect(x + 1, y + 1, Math.floor(32 * hp / Math.max(1, maxHp)), 2, c)
}

function drawGuideArrow() {
    if (!showGuide || rivalChase) { return }
    let a = Math.atan2(wayY[playerWp] - player.y, wayX[playerWp] - player.x)
    let ax = player.x + Math.cos(a) * 13
    let ay = player.y + Math.sin(a) * 13
    screen.fillRect(ax - 1, ay - 1, 2, 2, 5)
}

function paintRaceHud() {
    let now = game.runtime()
    drawWeather()
    screen.fillRect(0, 0, 160, 9, 15)
    if (rivalChase) {
        screen.print("WRECKS " + wrecksCaused, 1, 1, 2, image.font5)
        screen.print("T" + Math.max(0, Math.ceil((modeEndAt - now) / 1000)), 50, 1, 5, image.font5)
    } else {
        screen.print("L" + Math.min(totalLaps, playerLap + 1) + "/" + totalLaps, 1, 1, 1, image.font5)
        screen.print(placeText(playerPosition()), 26, 1, 5, image.font5)
        screen.print(timeText(currentLapMs()), 46, 1, 9, image.font5)
    }
    screen.print("" + Math.round(Math.abs(speed)), 84, 1, 7, image.font5)
    screen.print("$" + coins, 102, 1, 5, image.font5)
    drawHpBar(1, 11)
    drawFuelBars(1, 16)
    screen.print("M" + missileAmmo + " S" + slimeBombs + " K" + keysHeld, 38, 11, 2, image.font5)
    screen.print(weatherNames[weather], 112, 11, 9, image.font5)
    if (currentMode == MODE_ENDLESS) { screen.print("REPEAT #" + endlessRound, 80, 18, 3, image.font5) }
    if (currentMode == MODE_GRAND_PRIX) { screen.print("GP " + (gpRound + 1) + "/6 pts " + gpPoints, 80, 18, 3, image.font5) }
    if (currentMode == MODE_JET_JUMP) { screen.print("AIR " + jetJumpScore, 80, 18, 5, image.font5) }
    if (currentMode == MODE_DRIFT_KING) { screen.print("DRIFT " + driftScore, 80, 18, 5, image.font5) }
    if (currentMode == MODE_SLIME_SURVIVAL) { screen.print("SURVIVE " + Math.max(0, Math.ceil((modeEndAt - now) / 1000)), 80, 18, 7, image.font5) }
    if (now < shieldUntil) { screen.drawCircle(player.x, player.y, 10, 8) }
    if (now < magnetUntil) { screen.drawCircle(player.x, player.y, 12, 10) }
    if (now < lightUntil) { screen.drawRect(0, 9, 160, 111, lightColor) }
    drawGuideArrow()
    if (currentMode == MODE_BOSS) { drawBossBar() }
    if (now < countdownEnd) {
        screen.fillRect(66, 46, 28, 20, 15)
        screen.print("" + Math.ceil((countdownEnd - now) / 1000), 77, 52, 5, image.font8)
    } else if (now < countdownEnd + 700) {
        screen.print("GO!!!", 66, 52, 7, image.font8)
    }
    if (wreckedAt > 0) { screen.print("CRUNCHED!", 50, 52, 2, image.font8) }
    if (now < popUntil) { screen.print(popText, 80 - popText.length * 3, 30, popColor, image.font5) }
    if (now < newRecordUntil) { screen.print("NEW RECORD!", 46, 40, Math.floor(now / 100) % 15 + 1, image.font8) }
    if (gameState == STATE_PAUSED) { screen.print("PAUSED", 62, 30, 1, image.font8) }
}

// SUPER EZHAN title screen
function paintTitle() {
    let t = game.runtime()
    screen.fill(8)
    let i = 0
    while (i < 20) {
        screen.setPixel((i * 47 + Math.floor(t / 20)) % 160, (i * 31) % 120, 1)
        i += 1
    }
    // jets + rockets flying across
    let jx = (Math.floor(t / 15)) % 200 - 20
    screen.fillRect(jx, 20, 10, 3, 1)
    screen.fillRect(jx + 3, 17, 3, 9, 9)
    screen.fillRect(jx - 4, 21, 4, 1, 4)
    let rx = 180 - (Math.floor(t / 10)) % 200
    screen.fillRect(rx, 100, 8, 3, 2)
    screen.fillRect(rx + 8, 101, 4, 1, 4)
    bigText("SUPER", 80, 30, 5, 2, 15)
    bigText("EZHAN", 80, 50, 2, 3, 15)
    screen.printCenter("CAR  by Ezhan", 78, 1, image.font8)
    screen.printCenter("missiles - jets - rockets - slime", 90, 9, image.font5)
    if (Math.floor(t / 400) % 2 == 0) {
        screen.printCenter("PRESS A", 108, 5, image.font8)
    }
    if (playerImgs.length > 0) {
        screen.drawTransparentImage(playerImgs[Math.floor(t / 100) % 16], 8, 56)
        screen.drawTransparentImage(playerImgs[Math.floor(t / 100) % 16], 136, 56)
    }
}

function setupHud() {
    game.onPaint(function () {
        if (gameState == STATE_TITLE) {
            paintTitle()
        } else if (gameState == STATE_PAINT) {
            drawPaintMaker()
        } else if (gameState == STATE_CONNECT) {
            drawScan()
        } else if (gameState == STATE_RACING || gameState == STATE_PAUSED || gameState == STATE_RESULTS) {
            if (player) { paintRaceHud() }
        } else if (gameState == STATE_MENU && !menuOpen) {
            screen.printCenter("SUPER EZHAN CAR", 50, 5, image.font8)
            screen.printCenter("@" + username, 64, 1, image.font5)
        }
    })
}
