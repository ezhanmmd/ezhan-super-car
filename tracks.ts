// tracks.ts - 14 race tracks + the BOSS fortress + the Missile Mayhem arena.
// Tracks are made with MATH: every track is a loop of 20 waypoints from
//   x = 80 + A*cos(t) + B*cos(kx*t + phase)
//   y = 66 + C*sin(t) + D*sin(ky*t + phase)
// Changing the numbers makes a brand new track shape!
// We paint TWO pictures: "track" (what you see) and "surf" (what each pixel IS:
// road, slime, jet ramp, boost pad, lava, ice...).

const NUM_RACE_TRACKS = 14
const BOSS_TRACK = 14
const ARENA_TRACK = 15
const SECRET_TRACK = 16      // unlocked with golden keys!
const NUM_WAYPOINTS = 20

let trackNames = ["Super Ezhan Speedway", "Slime Swamp", "Jet Airport", "Rocket Launch Pad", "Sky Highway 8", "Volcano Valley", "Ice Planet", "Neon City", "Desert Canyon", "Candy Land", "Moon Base", "Missile Factory", "Jungle Twist", "Thunder Eight", "MEGA JET FORTRESS", "Missile Mayhem Arena", "SECRET Rainbow Road"]
let trA = [62, 56, 64, 56, 62, 48, 56, 54, 62, 56, 58, 60, 54, 0, 60, 0, 60]
let trB = [0, 8, -6, 10, 0, 8, 10, 10, 0, 8, 10, -8, 12, 60, 8, 0, 10]
let trKx = [1, 3, 3, 4, 1, 2, 3, 2, 1, 5, 2, 3, 4, 2, 5, 1, 2]
let trC = [40, 34, 40, 36, 0, 34, 36, 36, 28, 36, 38, 38, 34, 42, 38, 0, 38]
let trD = [0, 8, 6, -10, 40, 6, -8, -10, 14, -8, 0, -8, -8, 0, 8, 0, -6]
let trKy = [1, 3, 3, 4, 2, 2, 3, 2, 3, 5, 1, 3, 4, 1, 5, 1, 3]
let trPhase = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -90, 0, 0, 0]
let trOff = [7, 6, 13, 11, 9, 14, 1, 15, 13, 3, 12, 11, 6, 8, 15, 12, 15]      // ground color
let trRoad = [12, 12, 15, 12, 12, 15, 9, 12, 14, 11, 15, 15, 12, 15, 12, 13, 10]  // road color
let trKerbA = [2, 7, 1, 2, 1, 2, 8, 10, 4, 1, 1, 2, 5, 5, 2, 2, 2]
let trKerbB = [1, 6, 5, 1, 9, 4, 1, 8, 13, 3, 12, 1, 7, 15, 5, 1, 5]
let trRadius = [10, 10, 11, 9, 10, 9, 10, 9, 10, 9, 10, 9, 9, 9, 10, 0, 10]
let trSlime = [2, 14, 1, 2, 2, 3, 0, 3, 2, 5, 3, 4, 6, 3, 6, 6, 2]           // slime puddles
let trRamps = [2, 1, 4, 2, 3, 2, 2, 2, 2, 2, 3, 2, 2, 2, 3, 0, 4]           // jet ramps
let trBoosts = [2, 1, 2, 5, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 3, 0, 4]          // boost pads
let trLava = [0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 4, 0, 0, 10, 0, 0]           // lava pools beside the road
let trIce = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]             // 1 = icy road
let trStartWeather = [0, 1, 0, 0, 5, 7, 2, 6, 4, 0, 3, 8, 1, 9, 9, 0, 0]
// BRANCHES: a split in the road. The shortcut cuts straight across from
// waypoint "from" to waypoint "to". Type 1 = open shortcut, type 2 = SECRET
// GATE (needs a golden key). The normal road is the long way (with coins!).
let brFrom = [4, 12, 3, -1, -1, 12, 4, 13, -1, 3, 13, 4, -1, -1, 3, -1, 8]
let brTo = [8, 16, 7, -1, -1, 16, 8, 17, -1, 7, 17, 8, -1, -1, 7, -1, 12]
let brType = [1, 2, 1, 0, 0, 1, 2, 1, 0, 2, 1, 2, 0, 0, 2, 0, 1]
let trackUnlocked: boolean[] = []

let track = image.create(160, 120)
let surf = image.create(160, 120)
let trackId = 0
let wayX: number[] = []
let wayY: number[] = []
let roadRadius = 10
let startHeading = 0
let icyTrack = false
let rampW: number[] = []

function initTracks() {
    trackUnlocked = []
    let i = 0
    while (i < trackNames.length) {
        trackUnlocked.push(i < 4 || i == ARENA_TRACK)
        i += 1
    }
}

// paint one dot on BOTH pictures: what you see + what it is
function stamp(x: number, y: number, r: number, color: number, code: number) {
    track.fillCircle(x, y, r, color)
    surf.fillCircle(x, y, r, code)
}

function stampPixel(x: number, y: number, color: number, code: number) {
    track.setPixel(x, y, color)
    surf.setPixel(x, y, code)
}

function makeWaypoints(t: number) {
    wayX = []
    wayY = []
    let ph = trPhase[t] * Math.PI / 180
    let i = 0
    while (i < NUM_WAYPOINTS) {
        let a = 2 * Math.PI * i / NUM_WAYPOINTS
        let x = 80 + trA[t] * Math.cos(a) + trB[t] * Math.cos(trKx[t] * a + ph)
        let y = 66 + trC[t] * Math.sin(a) + trD[t] * Math.sin(trKy[t] * a + ph)
        wayX.push(Math.round(Math.max(13, Math.min(147, x))))
        wayY.push(Math.round(Math.max(23, Math.min(109, y))))
        i += 1
    }
}

function paintSegment(x0: number, y0: number, x1: number, y1: number, r: number, color: number, code: number) {
    let dx = x1 - x0
    let dy = y1 - y0
    let len = Math.sqrt(dx * dx + dy * dy)
    let steps = Math.max(1, Math.ceil(len / 2))
    let i = 0
    while (i <= steps) {
        let k = i / steps
        stamp(Math.round(x0 + dx * k), Math.round(y0 + dy * k), r, color, code)
        i += 1
    }
}

function paintLoop(r: number, color: number, code: number) {
    let i = 0
    while (i < NUM_WAYPOINTS) {
        let j = (i + 1) % NUM_WAYPOINTS
        paintSegment(wayX[i], wayY[i], wayX[j], wayY[j], r, color, code)
        i += 1
    }
}

// kerbs (striped edge), then the road on top, then a dashed middle line
function paintRoad(t: number) {
    paintLoop(roadRadius + 2, trKerbB[t], SURF_ROAD)
    let i = 0
    while (i < NUM_WAYPOINTS) {
        let j = (i + 1) % NUM_WAYPOINTS
        let dx = wayX[j] - wayX[i]
        let dy = wayY[j] - wayY[i]
        let steps = Math.ceil(Math.sqrt(dx * dx + dy * dy) / 5)
        let s = 0
        while (s < steps) {
            if (s % 2 == 0) {
                stamp(Math.round(wayX[i] + dx * s / steps), Math.round(wayY[i] + dy * s / steps), roadRadius + 2, trKerbA[t], SURF_ROAD)
            }
            s += 1
        }
        i += 1
    }
    let roadCode = icyTrack ? SURF_ICE : SURF_ROAD
    paintLoop(roadRadius, trRoad[t], roadCode)
    let k = 0
    while (k < NUM_WAYPOINTS) {
        let j2 = (k + 1) % NUM_WAYPOINTS
        let dx2 = wayX[j2] - wayX[k]
        let dy2 = wayY[j2] - wayY[k]
        let steps2 = Math.ceil(Math.sqrt(dx2 * dx2 + dy2 * dy2) / 3)
        let s2 = 0
        while (s2 < steps2) {
            if (s2 % 3 == 0) {
                track.setPixel(Math.round(wayX[k] + dx2 * s2 / steps2), Math.round(wayY[k] + dy2 * s2 / steps2), 1)
            }
            s2 += 1
        }
        k += 1
    }
}

// a stripe across the road at waypoint w (used for ramps, boost pads, finish)
function paintAcross(w: number, depth: number, code: number, c1: number, c2: number, chevron: boolean) {
    let j = (w + 1) % NUM_WAYPOINTS
    let dx = wayX[j] - wayX[w]
    let dy = wayY[j] - wayY[w]
    let len = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    let ux = dx / len
    let uy = dy / len
    let nx = 0 - uy
    let ny = ux
    let cx = (wayX[w] + wayX[j]) / 2
    let cy = (wayY[w] + wayY[j]) / 2
    let s = 0 - roadRadius
    while (s <= roadRadius) {
        let a = 0 - depth
        while (a <= depth) {
            let col = c1
            if (chevron) {
                if ((a + Math.floor(Math.abs(s) / 2)) % 3 == 0) { col = c2 }
            } else if ((a + s) % 2 == 0) {
                col = c2
            }
            stampPixel(Math.round(cx + nx * s + ux * a), Math.round(cy + ny * s + uy * a), col, code)
            a += 1
        }
        s += 1
    }
}

function drawFinishLine() {
    let dx = wayX[1] - wayX[0]
    let dy = wayY[1] - wayY[0]
    let len = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    let nx = 0 - dy / len
    let ny = dx / len
    let s = 0 - roadRadius
    while (s <= roadRadius) {
        let px = Math.round(wayX[0] + nx * s)
        let py = Math.round(wayY[0] + ny * s)
        let c = (Math.abs(s) % 2 == 0) ? 15 : 1
        track.setPixel(px, py, c)
        track.setPixel(px + 1, py, c == 1 ? 15 : 1)
        s += 1
    }
}

function paintSlimePuddle(x: number, y: number, r: number) {
    stamp(x, y, r, 7, SURF_SLIME)
    track.fillCircle(x - 1, y - 1, Math.max(1, r - 2), 6)
    track.setPixel(x + 1, y - 1, 1)
}

function scatterSlime(count: number) {
    let i = 0
    while (i < count) {
        let w = randint(2, NUM_WAYPOINTS - 1)
        paintSlimePuddle(wayX[w] + randint(-5, 5), wayY[w] + randint(-5, 5), randint(2, 4))
        i += 1
    }
}

// spread special pads evenly but never on the start line
function padWaypoints(count: number, offset: number): number[] {
    let list: number[] = []
    let i = 0
    while (i < count) {
        let w = (offset + Math.floor((i + 0.5) * NUM_WAYPOINTS / Math.max(1, count))) % NUM_WAYPOINTS
        if (w <= 1) { w = 3 }
        list.push(w)
        i += 1
    }
    return list
}

function scatterLava(count: number) {
    let i = 0
    let tries = 0
    while (i < count && tries < 300) {
        tries += 1
        let x = randint(4, 156)
        let y = randint(22, 116)
        if (surf.getPixel(x, y) == SURF_OFF) {
            let r = randint(3, 6)
            stamp(x, y, r, 2, SURF_LAVA)
            track.fillCircle(x, y, r - 2, 4)
            // put the road back if the lava spilled on it
            i += 1
        }
    }
}

// ---------- decorations so every track looks different ----------
function decorate(t: number) {
    let i = 0
    let tries = 0
    while (i < 60 && tries < 600) {
        tries += 1
        let x = randint(2, 157)
        let y = randint(12, 118)
        if (surf.getPixel(x, y) != SURF_OFF) { continue }
        i += 1
        if (t == 0 || t == 12) {                 // trees
            track.fillCircle(x, y, 2, 6)
            track.setPixel(x, y, 7)
        } else if (t == 1) {                     // bubbles in the swamp
            track.drawCircle(x, y, 1, 7)
        } else if (t == 2) {                     // runway lights
            track.setPixel(x, y, (x + y) % 2 == 0 ? 5 : 1)
        } else if (t == 3) {                     // little rockets on pads
            track.fillRect(x, y, 1, 3, 1)
            track.setPixel(x, y + 3, 4)
        } else if (t == 4) {                     // clouds
            track.fillCircle(x, y, 2, 1)
        } else if (t == 5) {                     // rocks
            track.fillRect(x, y, 2, 2, 15)
        } else if (t == 6) {                     // snow sparkle
            track.setPixel(x, y, 9)
        } else if (t == 7) {                     // neon windows
            track.fillRect(x, y, 2, 1, [2, 5, 8, 10, 3][i % 5])
        } else if (t == 8) {                     // cactus
            track.fillRect(x, y, 1, 3, 7)
            track.setPixel(x - 1, y + 1, 7)
        } else if (t == 9) {                     // candy dots
            track.fillCircle(x, y, 1, [2, 5, 9, 10, 1][i % 5])
        } else if (t == 10) {                    // moon craters
            track.drawCircle(x, y, 2, 13)
        } else if (t == 11) {                    // factory missiles
            track.fillRect(x, y, 3, 1, 2)
            track.setPixel(x + 3, y, 1)
        } else if (t == 13) {                    // lightning sparks
            track.setPixel(x, y, 5)
        } else {                                 // boss fortress spikes
            track.setPixel(x, y, 2)
            track.setPixel(x + 1, y, 4)
        }
    }
}

function buildArena() {
    track.fill(13)
    surf.fill(SURF_ROAD)
    // checker floor
    let x = 0
    while (x < 160) {
        let y = 12
        while (y < 120) {
            if ((Math.floor(x / 10) + Math.floor(y / 10)) % 2 == 0) {
                track.fillRect(x, y, 10, 10, 12)
            }
            y += 10
        }
        x += 10
    }
    // walls
    track.drawRect(0, 11, 160, 109, 2)
    track.drawRect(1, 12, 158, 107, 4)
    // pillars are lava blocks!
    let px = [40, 120, 40, 120, 80]
    let py = [40, 40, 92, 92, 66]
    let i = 0
    while (i < px.length) {
        stamp(px[i], py[i], 5, 2, SURF_LAVA)
        track.fillCircle(px[i], py[i], 3, 4)
        i += 1
    }
    // a ring of waypoints so rivals still know where to drive
    wayX = []
    wayY = []
    let k = 0
    while (k < NUM_WAYPOINTS) {
        let a = 2 * Math.PI * k / NUM_WAYPOINTS
        wayX.push(Math.round(80 + 58 * Math.cos(a)))
        wayY.push(Math.round(66 + 38 * Math.sin(a)))
        k += 1
    }
    scatterSlime(6)
    roadRadius = 30
}

function loadTrack(t: number) {
    trackId = t
    icyTrack = trIce[t] == 1
    roadRadius = trRadius[t]
    if (t == ARENA_TRACK) {
        buildArena()
    } else {
        track.fill(trOff[t])
        surf.fill(SURF_OFF)
        makeWaypoints(t)
        paintRoad(t)
        scatterSlime(trSlime[t])
        rampW = padWaypoints(trRamps[t], 1)
        let i = 0
        while (i < rampW.length) {
            paintAcross(rampW[i], 3, SURF_RAMP, 4, 5, true)
            i += 1
        }
        let boosts = padWaypoints(trBoosts[t], 4)
        let b = 0
        while (b < boosts.length) {
            if (rampW.indexOf(boosts[b]) < 0) {
                paintAcross(boosts[b], 2, SURF_BOOST, 8, 9, true)
            }
            b += 1
        }
        paintBranch(t)
        scatterLava(trLava[t])
        decorate(t)
        drawFinishLine()
    }
    startHeading = Math.atan2(wayY[1] - wayY[0], wayX[1] - wayX[0]) * 180 / Math.PI
    scene.setBackgroundImage(track)
}

// ---------- track branches + secret gates ----------
function hasBranch(t: number): boolean {
    return brFrom[t] >= 0
}

function branchGated(t: number): boolean {
    return brType[t] == 2 && !gateOpen(t)
}

function branchMidX(): number { return Math.round((wayX[brFrom[trackId]] + wayX[brTo[trackId]]) / 2) }
function branchMidY(): number { return Math.round((wayY[brFrom[trackId]] + wayY[brTo[trackId]]) / 2) }

function paintBranch(t: number) {
    if (!hasBranch(t)) {
        return
    }
    let f = brFrom[t]
    let e = brTo[t]
    let r = Math.max(5, roadRadius - 3)
    paintSegment(wayX[f], wayY[f], wayX[e], wayY[e], r + 1, trKerbA[t], SURF_ROAD)
    paintSegment(wayX[f], wayY[f], wayX[e], wayY[e], r, trRoad[t], icyTrack ? SURF_ICE : SURF_ROAD)
    // shortcuts are risky: a slime puddle in the middle
    paintSlimePuddle(branchMidX(), branchMidY(), 3)
    // little arrows that say SHORTCUT
    let k = 1
    while (k < 4) {
        let x = Math.round(wayX[f] + (wayX[e] - wayX[f]) * k / 4)
        let y = Math.round(wayY[f] + (wayY[e] - wayY[f]) * k / 4)
        track.setPixel(x, y, 5)
        k += 1
    }
    if (branchGated(t)) {
        paintGate(t)
    }
}

// a striped gate across the shortcut, a bit after it starts
function paintGate(t: number) {
    let f = brFrom[t]
    let e = brTo[t]
    let dx = wayX[e] - wayX[f]
    let dy = wayY[e] - wayY[f]
    let len = Math.max(1, Math.sqrt(dx * dx + dy * dy))
    let ux = dx / len
    let uy = dy / len
    let gx = wayX[f] + ux * (roadRadius + 6)
    let gy = wayY[f] + uy * (roadRadius + 6)
    let s = 0 - roadRadius
    while (s <= roadRadius) {
        let a = -1
        while (a <= 1) {
            let c = (Math.floor((s + 20) / 2) % 2 == 0) ? 5 : 14
            stampPixel(Math.round(gx - uy * s + ux * a), Math.round(gy + ux * s + uy * a), c, SURF_GATE)
            a += 1
        }
        s += 1
    }
    // keyhole
    track.fillRect(Math.round(gx) - 1, Math.round(gy) - 1, 3, 3, 15)
    track.setPixel(Math.round(gx), Math.round(gy), 5)
}

function surfaceAt(x: number, y: number): number {
    if (x < 0 || x >= 160 || y < 0 || y >= 120) {
        return SURF_OFF
    }
    return surf.getPixel(Math.floor(x), Math.floor(y))
}

// starting grid: walk BACKWARDS along the track from the finish line
function gridPos(slot: number): number[] {
    let back = 7 + Math.floor(slot / 2) * 9
    let side = (slot % 2 == 0) ? -4 : 4
    let w = 0
    let x = wayX[0]
    let y = wayY[0]
    let left = back
    let guard = 0
    while (left > 0 && guard < NUM_WAYPOINTS) {
        guard += 1
        let p = (w + NUM_WAYPOINTS - 1) % NUM_WAYPOINTS
        let dx = wayX[p] - x
        let dy = wayY[p] - y
        let len = Math.sqrt(dx * dx + dy * dy)
        if (len >= left) {
            x = x + dx * left / len
            y = y + dy * left / len
            left = 0
        } else {
            x = wayX[p]
            y = wayY[p]
            left -= len
            w = p
        }
    }
    let a = startHeading * Math.PI / 180
    return [x - Math.sin(a) * side, y + Math.cos(a) * side]
}
