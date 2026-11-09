// paint.ts - the PAINT MAKER: color your car part by part with a LIVE preview.
// UP/DOWN = pick a part (body, stripes, wheels, windows, lights)
// LEFT/RIGHT = pick one of the 15 colors
// A = rainbow random   MENU = copy body color to everything   B = save + exit

let partColor = [2, 5, 15, 9, 5]
let partNames = ["BODY", "STRIPES", "WHEELS", "WINDOWS", "LIGHTS"]
let paintPart = 0
let paintSpin = 0
let paintDone: () => void = null
let paintPreview: Image = null

function openPaintMaker(done: () => void) {
    paintDone = done
    paintPart = 0
    gameState = STATE_PAINT
    if (player) { player.setFlag(SpriteFlag.Invisible, true) }
    refreshPaintPreview()
    popSound()
}

function refreshPaintPreview() {
    paintPreview = buildCarBase()
    rebuildPlayerImages()
}

function changePaintColor(step: number) {
    let c = partColor[paintPart] + step
    if (c > 15) { c = 1 }
    if (c < 1) { c = 15 }
    partColor[paintPart] = c
    refreshPaintPreview()
    popSound()
}

function closePaintMaker() {
    saveCarAndPaint()
    // the car shows again when a race starts or the pause menu resumes
    gameState = STATE_MENU
    buySound()
    let d = paintDone
    paintDone = null
    if (d) {
        control.runInParallel(function () {
            pause(120)
            d()
        })
    }
}

function rainbowPaint() {
    let i = 0
    while (i < NUM_PARTS) {
        partColor[i] = randint(1, 15)
        i += 1
    }
    refreshPaintPreview()
    bigPopSound()
}

function paintAllOneColor() {
    let i = 1
    while (i < NUM_PARTS) {
        partColor[i] = partColor[PART_BODY]
        i += 1
    }
    refreshPaintPreview()
    squishSound()
}

function paintButtons() {
    controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
        if (gameState == STATE_PAINT) {
            paintPart = (paintPart + NUM_PARTS - 1) % NUM_PARTS
            menuMoveSound()
        }
    })
    controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
        if (gameState == STATE_PAINT) { changePaintColor(-1) }
    })
    controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
        if (gameState == STATE_PAINT) { changePaintColor(1) }
    })
    controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
        if (gameState == STATE_PAINT) { changePaintColor(-1) }
    })
    controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
        if (gameState == STATE_PAINT) { changePaintColor(1) }
    })
    // A (rainbow), DOWN (next part) and MENU (all one color) are handled in
    // main.ts, because MakeCode only keeps ONE onEvent handler per button.
    controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
        if (gameState == STATE_PAINT) { closePaintMaker() }
    })
}

// drawn every frame while the paint maker is open
function drawPaintMaker() {
    screen.fill(15)
    screen.fillRect(0, 0, 160, 11, 9)
    screen.print("PAINT MAKER - " + carNames[currentCar], 3, 2, 1, image.font5)
    // spinning live preview, 4x big
    paintSpin = (paintSpin + 1) % 320
    if (paintPreview) {
        let spun = rotate16(paintPreview, Math.floor(paintSpin / 20) * 22.5)
        screen.fillRect(6, 16, 68, 68, 12)
        screen.drawRect(6, 16, 68, 68, 1)
        drawScaled(spun, 8, 18, 4)
    }
    // the 5 parts: name, color swatch and color name
    let i = 0
    while (i < NUM_PARTS) {
        let y = 18 + i * 13
        let c = i == paintPart ? 5 : 1
        if (i == paintPart) {
            screen.fillRect(78, y - 2, 81, 11, 12)
            screen.print(">", 74, y, 5, image.font5)
        }
        screen.print(partNames[i], 80, y, c, image.font5)
        screen.fillRect(118, y - 1, 12, 8, partColor[i])
        screen.drawRect(118, y - 1, 12, 8, 1)
        screen.print(colorNames[partColor[i] - 1].substr(0, 5), 132, y, c, image.font5)
        i += 1
    }
    // the 15-color palette with a box around the chosen color
    let k = 1
    while (k <= 15) {
        let x = 5 + (k - 1) * 10
        screen.fillRect(x, 90, 9, 9, k)
        screen.drawRect(x, 90, 9, 9, 12)
        if (k == partColor[paintPart]) {
            screen.drawRect(x - 1, 89, 11, 11, 5)
            screen.drawRect(x - 2, 88, 13, 13, 1)
        }
        k += 1
    }
    screen.print("UP/DN part  L/R color  A rainbow", 2, 104, 1, image.font5)
    screen.print("MENU = all one color   B = save", 2, 112, 13, image.font5)
}
