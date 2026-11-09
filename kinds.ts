// kinds.ts - SUPER EZHAN CAR: sprite kinds, game states, modes and car specials
// Everything else in the game uses these names, so this file loads first.

namespace SpriteKind {
    export const Missile = SpriteKind.create()       // your missiles
    export const EnemyMissile = SpriteKind.create()  // rival + boss missiles
    export const PowerUp = SpriteKind.create()       // glowing pick-ups
    export const Slime = SpriteKind.create()         // squishy slime puddles
    export const Particle = SpriteKind.create()      // sparks, smoke, splats
    export const Boss = SpriteKind.create()          // MEGA JET KING
    export const Shadow = SpriteKind.create()        // shadow under flying cars
    export const Fuel = SpriteKind.create()          // rocket fuel cans
    export const Key = SpriteKind.create()           // golden keys!
    export const Drone = SpriteKind.create()         // your robot drone helper
}

// ---------- game states ----------
const STATE_TITLE = 0
const STATE_MENU = 1
const STATE_RACING = 2
const STATE_PAUSED = 3
const STATE_RESULTS = 4
const STATE_PAINT = 5
const STATE_BETWEEN = 6
const STATE_CONNECT = 7   // the fake WiFi / Bluetooth / Car scanner

// ---------- modes ----------
const MODE_RACE = 0
const MODE_GRAND_PRIX = 1
const MODE_ENDLESS = 2
const MODE_TIME_TRIAL = 3
const MODE_BOSS = 4
const MODE_MISSILE_MAYHEM = 5
const MODE_ROCKET_RALLY = 6
const MODE_SLIME_SURVIVAL = 7
const MODE_JET_JUMP = 8
const MODE_DRIFT_KING = 9
const NUM_MODES = 10

let modeNames = ["Race", "Super Grand Prix", "Endless Repeat", "Time Trial", "BOSS: Mega Jet King", "Missile Mayhem", "Rocket Rally", "Slime Survival", "Jet Jump Challenge", "Drift King"]

// ---------- car specials ----------
const SP_NONE = 0
const SP_MISSILE = 1    // shoots missiles in ALL directions
const SP_JET = 2        // jet wings: long flights off ramps + cheap jet hops
const SP_ROCKET = 3     // rocket engine: hold UP to fly
const SP_SLIME = 4      // drops slime bombs behind it
const SP_TANK = 5       // super armor + big cannon
const SP_HOVER = 6      // floats over slime and lava
const SP_SUPER = 7      // SUPER EZHAN: everything at once!

let specialNames = ["Classic", "Missile Storm", "Jet Wings", "Rocket Engine", "Slime Bombs", "Tank Armor", "Hover Pads", "SUPER EZHAN POWER"]

// ---------- surfaces (stored in the surface map, see tracks.ts) ----------
const SURF_OFF = 0      // grass / sand / sky - slow
const SURF_ROAD = 1
const SURF_SLIME = 2    // squishy, slippery
const SURF_RAMP = 3     // jet-boost ramp: you FLY
const SURF_BOOST = 4    // speed pad
const SURF_LAVA = 5     // hurts!
const SURF_ICE = 6      // super slippery
const SURF_GATE = 7     // a locked secret gate (needs a KEY) - acts like a wall

let gameState = STATE_TITLE
let currentMode = MODE_RACE
