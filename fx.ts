// fx.ts - particles: sparks, smoke puffs, slime splats, explosions, confetti.
// Particles are tiny sprites that fly out and disappear (lifespan).

const MAX_PARTICLES = 70
let particleCount = 0

function dotImage(color: number, size: number): Image {
    let im = image.create(size, size)
    im.fill(color)
    return im
}

let dotCache: Image[] = []
function cachedDot(color: number): Image {
    if (dotCache.length == 0) {
        let c = 0
        while (c < 16) {
            dotCache.push(dotImage(c, 2))
            c += 1
        }
    }
    return dotCache[color % 16]
}

function particle(x: number, y: number, color: number, vx: number, vy: number, life: number) {
    if (sprites.allOfKind(SpriteKind.Particle).length >= MAX_PARTICLES) {
        return
    }
    let p = sprites.create(cachedDot(color), SpriteKind.Particle)
    p.setPosition(x, y)
    p.setVelocity(vx, vy)
    p.setFlag(SpriteFlag.Ghost, true)
    p.setFlag(SpriteFlag.AutoDestroy, true)
    p.lifespan = life
    p.z = 20
}

// burst of sparks in every direction
function sparks(x: number, y: number, color: number, count: number, spd: number) {
    let i = 0
    while (i < count) {
        let a = Math.PI * 2 * i / count + Math.random() * 0.5
        let s = spd * (0.5 + Math.random() * 0.7)
        particle(x, y, color, Math.cos(a) * s, Math.sin(a) * s, 250 + randint(0, 250))
        i += 1
    }
}

function smokePuff(x: number, y: number, color: number) {
    particle(x + randint(-1, 1), y + randint(-1, 1), color, randint(-8, 8), randint(-8, 8), 350)
}

// green splat that flies out and leaves droplets
function slimeSplat(x: number, y: number, color: number) {
    let i = 0
    while (i < 10) {
        let a = Math.random() * Math.PI * 2
        let s = 20 + Math.random() * 45
        particle(x, y, i % 3 == 0 ? 1 : color, Math.cos(a) * s, Math.sin(a) * s, 300 + randint(0, 200))
        i += 1
    }
}

// boom: orange + yellow + red ring, a shake and a crunch
function explosion(x: number, y: number, big: boolean) {
    sparks(x, y, 4, big ? 14 : 8, big ? 90 : 60)
    sparks(x, y, 5, big ? 10 : 6, big ? 60 : 40)
    sparks(x, y, 2, 6, 30)
    if (big) {
        shake(4, 250)
        megaCrunchSound()
    } else {
        shake(2, 120)
        boomSound()
    }
}

function confetti(count: number) {
    let i = 0
    while (i < count) {
        particle(randint(0, 160), randint(0, 20), randint(1, 14), randint(-20, 20), randint(20, 70), 1500)
        i += 1
    }
}

function clearKind(k: number) {
    let list = sprites.allOfKind(k)
    let i = 0
    while (i < list.length) {
        list[i].destroy()
        i += 1
    }
}
