// art.ts - every car is DRAWN BY CODE (no image files needed).
// A car picture is 16x16 and faces RIGHT. Then we spin it into 16 directions.
// Colors come from the 5 paint parts: body, stripes, wheels, windows, lights.

const PART_BODY = 0
const PART_STRIPE = 1
const PART_WHEEL = 2
const PART_WINDOW = 3
const PART_LIGHT = 4
const NUM_PARTS = 5

let colorNames = ["White", "Red", "Pink", "Orange", "Yellow", "Teal", "Green", "Blue", "Sky", "Purple", "Lilac", "Plum", "Tan", "Brown", "Black"]

// 4 wheels at the corners. big = monster truck wheels
function drawWheels(img: Image, wheel: number, big: boolean) {
    if (big) {
        img.fillRect(1, 0, 4, 3, wheel)
        img.fillRect(10, 0, 4, 3, wheel)
        img.fillRect(1, 13, 4, 3, wheel)
        img.fillRect(10, 13, 4, 3, wheel)
    } else {
        img.fillRect(2, 1, 3, 2, wheel)
        img.fillRect(10, 1, 3, 2, wheel)
        img.fillRect(2, 13, 3, 2, wheel)
        img.fillRect(10, 13, 3, 2, wheel)
    }
}

function drawCarShape(img: Image, shape: number, body: number, stripe: number, wheel: number, win: number, light: number) {
    img.fill(0)
    if (shape == 0) {
        // SUPER EZHAN GT - classic sports car with pointy nose
        drawWheels(img, wheel, false)
        img.fillRect(1, 3, 13, 10, body)
        img.fillRect(14, 4, 1, 8, body)
        img.fillRect(1, 7, 14, 2, stripe)
        img.fillRect(9, 4, 2, 8, win)
        img.setPixel(15, 5, light)
        img.setPixel(15, 10, light)
    } else if (shape == 1) {
        // MISSILE CAR - turret in the middle and missile pods on both sides
        drawWheels(img, wheel, false)
        img.fillRect(1, 3, 14, 10, body)
        img.fillRect(2, 2, 10, 1, stripe)
        img.fillRect(2, 13, 10, 1, stripe)
        img.fillCircle(7, 7, 3, stripe)
        img.fillRect(7, 7, 8, 2, win)          // missile tube
        img.setPixel(15, 7, light)
        img.setPixel(15, 8, light)
        img.fillRect(3, 4, 5, 1, 2)            // red missile pods
        img.fillRect(3, 11, 5, 1, 2)
        img.setPixel(8, 4, 1)
        img.setPixel(8, 11, 1)
    } else if (shape == 2) {
        // JET RACER - wings stick out the sides, tail fin at the back
        img.fillRect(3, 5, 12, 6, body)
        img.fillRect(15, 7, 1, 2, body)
        img.fillRect(5, 0, 4, 5, stripe)       // wings
        img.fillRect(5, 11, 4, 5, stripe)
        img.fillRect(0, 6, 3, 4, stripe)       // tail
        img.fillRect(10, 6, 3, 4, win)         // cockpit
        img.setPixel(0, 7, light)
        img.setPixel(0, 8, light)
        img.setPixel(3, 4, wheel)
        img.setPixel(3, 11, wheel)
        img.setPixel(12, 4, wheel)
        img.setPixel(12, 11, wheel)
    } else if (shape == 3) {
        // ROCKET CAR - giant nozzle at the back and fins
        drawWheels(img, wheel, false)
        img.fillRect(3, 4, 11, 8, body)
        img.fillRect(14, 5, 1, 6, body)
        img.fillRect(15, 7, 1, 2, light)
        img.fillRect(0, 5, 3, 6, stripe)       // nozzle
        img.fillRect(0, 6, 1, 4, 4)            // fire inside
        img.fillRect(4, 3, 3, 1, stripe)       // fins
        img.fillRect(4, 12, 3, 1, stripe)
        img.fillRect(9, 6, 3, 4, win)
        img.fillRect(3, 7, 11, 2, stripe)
    } else if (shape == 4) {
        // F1 - thin body, big front and rear wings
        img.fillRect(2, 1, 3, 3, wheel)
        img.fillRect(2, 12, 3, 3, wheel)
        img.fillRect(11, 1, 3, 3, wheel)
        img.fillRect(11, 12, 3, 3, wheel)
        img.fillRect(1, 6, 14, 4, body)
        img.fillRect(0, 3, 1, 10, stripe)
        img.fillRect(15, 4, 1, 8, stripe)
        img.fillRect(7, 7, 2, 2, win)
        img.fillRect(1, 7, 14, 1, stripe)
        img.setPixel(14, 6, light)
        img.setPixel(14, 9, light)
    } else if (shape == 5) {
        // MONSTER TRUCK - huge wheels
        drawWheels(img, wheel, true)
        img.fillRect(1, 3, 14, 10, body)
        img.fillRect(8, 4, 3, 8, win)
        img.fillRect(1, 4, 6, 8, stripe)
        img.fillRect(2, 5, 4, 6, body)
        img.setPixel(15, 4, light)
        img.setPixel(15, 11, light)
    } else if (shape == 6) {
        // SLIME BUGGY - round blob with slime dripping
        drawWheels(img, wheel, false)
        img.fillCircle(8, 8, 6, body)
        img.fillCircle(8, 8, 3, stripe)
        img.fillRect(9, 6, 2, 4, win)
        img.setPixel(1, 6, 7)
        img.setPixel(0, 9, 7)
        img.setPixel(2, 11, 7)
        img.setPixel(14, 7, light)
        img.setPixel(14, 9, light)
    } else if (shape == 7) {
        // MUSCLE CAR - long hood, double stripes
        drawWheels(img, wheel, false)
        img.fillRect(0, 3, 16, 10, body)
        img.fillRect(0, 6, 16, 1, stripe)
        img.fillRect(0, 9, 16, 1, stripe)
        img.fillRect(5, 4, 3, 8, win)
        img.setPixel(15, 4, light)
        img.setPixel(15, 11, light)
    } else if (shape == 8) {
        // MINI - short and cute
        img.fillRect(4, 2, 2, 2, wheel)
        img.fillRect(10, 2, 2, 2, wheel)
        img.fillRect(4, 12, 2, 2, wheel)
        img.fillRect(10, 12, 2, 2, wheel)
        img.fillRect(3, 4, 10, 8, body)
        img.fillRect(6, 4, 4, 8, stripe)
        img.fillRect(7, 5, 2, 6, win)
        img.setPixel(13, 5, light)
        img.setPixel(13, 10, light)
    } else if (shape == 9) {
        // HOVER CAR - no wheels, glowing pads
        img.fillRect(1, 4, 14, 8, body)
        img.fillRect(0, 2, 16, 2, wheel)
        img.fillRect(0, 12, 16, 2, wheel)
        img.fillRect(2, 2, 2, 1, light)
        img.fillRect(12, 13, 2, 1, light)
        img.fillRect(9, 6, 3, 4, win)
        img.fillRect(1, 7, 8, 2, stripe)
    } else if (shape == 10) {
        // POLICE - red and blue roof lights
        drawWheels(img, wheel, false)
        img.fillRect(1, 3, 14, 10, body)
        img.fillRect(1, 3, 3, 10, stripe)
        img.fillRect(12, 3, 3, 10, stripe)
        img.fillRect(9, 5, 2, 6, win)
        img.fillRect(6, 5, 2, 3, 2)
        img.fillRect(6, 8, 2, 3, 8)
        img.setPixel(15, 4, light)
        img.setPixel(15, 11, light)
    } else if (shape == 11) {
        // DRIFT LEGEND - huge spoiler
        drawWheels(img, wheel, false)
        img.fillRect(2, 3, 13, 10, body)
        img.fillRect(0, 2, 2, 12, stripe)
        img.fillRect(2, 5, 13, 1, stripe)
        img.fillRect(2, 10, 13, 1, stripe)
        img.fillRect(9, 6, 2, 4, win)
        img.setPixel(15, 4, light)
        img.setPixel(15, 11, light)
    } else if (shape == 12) {
        // PLANE CAR - big wings and a propeller on the nose
        img.fillRect(2, 5, 12, 6, body)
        img.fillRect(6, 0, 3, 16, stripe)      // wings
        img.fillRect(0, 4, 2, 8, stripe)       // tail
        img.fillRect(14, 3, 1, 10, light)      // spinning propeller
        img.fillRect(10, 6, 2, 4, win)
        img.setPixel(3, 4, wheel)
        img.setPixel(3, 11, wheel)
        img.setPixel(11, 4, wheel)
        img.setPixel(11, 11, wheel)
    } else if (shape == 13) {
        // TANK - tracks and a long cannon
        img.fillRect(0, 1, 13, 3, wheel)
        img.fillRect(0, 12, 13, 3, wheel)
        img.fillRect(1, 4, 11, 8, body)
        img.fillCircle(6, 8, 3, stripe)
        img.fillRect(7, 7, 9, 2, win)
        img.setPixel(15, 7, light)
        let t = 0
        while (t < 13) {
            img.setPixel(t, 2, stripe)
            img.setPixel(t, 13, stripe)
            t += 3
        }
    } else {
        // SUPER EZHAN X - wings + rocket + missiles + an "E" on the roof
        img.fillRect(2, 1, 3, 2, wheel)
        img.fillRect(11, 1, 3, 2, wheel)
        img.fillRect(2, 13, 3, 2, wheel)
        img.fillRect(11, 13, 3, 2, wheel)
        img.fillRect(2, 3, 13, 10, body)
        img.fillRect(15, 5, 1, 6, body)
        img.fillRect(0, 5, 2, 6, stripe)       // rocket
        img.setPixel(0, 7, 4)
        img.setPixel(0, 8, 4)
        img.fillRect(6, 3, 3, 1, stripe)       // little wings
        img.fillRect(6, 12, 3, 1, stripe)
        // the letter E
        img.fillRect(5, 5, 1, 6, win)
        img.fillRect(5, 5, 4, 1, win)
        img.fillRect(5, 7, 3, 1, win)
        img.fillRect(5, 10, 4, 1, win)
        img.fillRect(11, 5, 2, 6, win)
        img.setPixel(15, 5, light)
        img.setPixel(15, 10, light)
    }
}

// rotate a 16x16 picture by deg degrees (nearest pixel)
function rotate16(src: Image, deg: number): Image {
    let out = image.create(16, 16)
    let rad = deg * Math.PI / 180
    let c = Math.cos(rad)
    let s = Math.sin(rad)
    let y = 0
    while (y < 16) {
        let x = 0
        while (x < 16) {
            let dx = x - 7.5
            let dy = y - 7.5
            let sx = Math.round(c * dx + s * dy + 7.5)
            let sy = Math.round(0 - s * dx + c * dy + 7.5)
            if (sx >= 0 && sx < 16 && sy >= 0 && sy < 16) {
                let p = src.getPixel(sx, sy)
                if (p != 0) {
                    out.setPixel(x, y, p)
                }
            }
            x += 1
        }
        y += 1
    }
    return out
}

function spin16(src: Image): Image[] {
    let list: Image[] = []
    let d = 0
    while (d < 16) {
        list.push(rotate16(src, d * 22.5))
        d += 1
    }
    return list
}

function dirIndex(deg: number): number {
    let d = Math.round(deg / 22.5) % 16
    if (d < 0) { d += 16 }
    return d
}

// draw an image bigger (scale 2, 3, 4...) straight onto the screen
function drawScaled(src: Image, x: number, y: number, scale: number) {
    let yy = 0
    while (yy < src.height) {
        let xx = 0
        while (xx < src.width) {
            let p = src.getPixel(xx, yy)
            if (p != 0) {
                screen.fillRect(x + xx * scale, y + yy * scale, scale, scale, p)
            }
            xx += 1
        }
        yy += 1
    }
}

// BIG letters: print the text small into a picture, then draw it scaled up
function bigText(t: string, cx: number, y: number, color: number, scale: number, outline: number) {
    let w = t.length * 6
    let tmp = image.create(w, 8)
    tmp.print(t, 0, 0, color, image.font8)
    let x = cx - Math.floor(w * scale / 2)
    if (outline >= 0) {
        let out = image.create(w, 8)
        out.print(t, 0, 0, outline, image.font8)
        drawScaled(out, x + 1, y + 1, scale)
        drawScaled(out, x - 1, y + 1, scale)
    }
    drawScaled(tmp, x, y, scale)
}

// a 4x4 shadow blob for flying cars
function shadowImage(size: number): Image {
    let im = image.create(size, Math.max(2, Math.floor(size / 2)))
    im.fillRect(1, 0, size - 2, im.height, 15)
    return im
}

// a 24x24 boss truck with jet wings
function bossImage(phase: number): Image {
    let im = image.create(24, 24)
    let body = 2
    if (phase == 2) { body = 10 }
    if (phase >= 3) { body = 15 }
    im.fillRect(2, 0, 8, 4, 15)
    im.fillRect(14, 0, 8, 4, 15)
    im.fillRect(2, 20, 8, 4, 15)
    im.fillRect(14, 20, 8, 4, 15)
    im.fillRect(1, 4, 22, 16, body)
    im.fillRect(0, 7, 3, 10, 4)              // jet engines
    im.fillRect(6, 1, 6, 3, 5)               // wings
    im.fillRect(6, 20, 6, 3, 5)
    im.fillRect(15, 7, 4, 10, 9)             // window
    im.fillRect(4, 10, 10, 4, 5)             // crown stripe
    im.setPixel(5, 9, 5)
    im.setPixel(8, 8, 5)
    im.setPixel(11, 9, 5)
    im.fillRect(22, 6, 2, 3, 4)
    im.fillRect(22, 15, 2, 3, 4)
    return im
}
