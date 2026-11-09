// shop.ts - the MEGA SHOP. Items are NOT stored in a list: every item is just a
// number (its index) and we DECODE the number into a name, colors and a price.
// That is how the shop can have over 100,000 items without running out of memory.
//
// Example: Mega Kit number 4321 ->
//   body   = 4321 % 15            -> color
//   stripe = (4321 / 15) % 15     -> color
//   wheels = (4321 / 225) % 15    -> color
//   style  = 4321 / 3375          -> one of 30 patterns
//
// You can WEAR many items at once (stacking), and coins are INFINITE.

const CAT_KIT = 0
const CAT_DECAL = 1
const CAT_STICKER = 2
const CAT_TRAIL = 3
const CAT_NEON = 4
const CAT_TOPPER = 5
const CAT_WINGS = 6
const CAT_BOOSTER = 7
const CAT_RIMS = 8
const CAT_EXHAUST = 9
const CAT_HORN = 10
const CAT_MISSILE_SKIN = 11
const CAT_SLIME_COLOR = 12
const CAT_ROBOT = 13          // robot arms, drone helper, auto-turret, robo-shield
const CAT_UPGRADE_KIT = 14
const CAT_SUPPLY = 15
const NUM_CATS = 16
const FIRST_CONSUMABLE = 14

let catNames = ["Mega Paint Kits", "Decals", "Stickers", "Trails", "Neon", "Toppers", "Jet Wings", "Rocket Boosters", "Rims", "Exhaust", "Horns", "Missile Skins", "Slime Colors", "Robot Add-ons", "Upgrade Kits", "Supplies"]
// sizes: styles x 15 colors (kits are 15 x 15 x 15 x 30)
let catSizes = [101250, 300, 240, 180, 150, 180, 120, 120, 150, 120, 120, 150, 120, 600, 80, 24]
// how many of each category you can wear at the SAME time
let catStack = [1, 4, 6, 3, 2, 2, 1, 2, 1, 2, 3, 1, 1, 4, 99, 99]
let catBasePrice = [50, 150, 80, 200, 250, 180, 600, 500, 220, 180, 120, 300, 200, 900, 0, 300]

let kitPatterns = ["Racer", "Zebra", "Checker", "Flame", "Bolt", "Galaxy", "Camo", "Tiger", "Slime Drip", "Jet Stream", "Rocket", "Missile", "Pixel", "Wave", "Star", "Heart", "Crown", "Diamond", "Split", "Dots", "Rings", "Arrow", "Skull", "Moon", "Sun", "Rain", "Fire", "Ice", "Neon Edge", "SUPER E"]
let decalStyles = ["Stripe", "Twin", "Checker", "Flames", "Bolt", "Galaxy", "Camo", "Tiger", "Drip", "Jet", "Tail", "Pods", "Pixel", "Wave", "Star", "Heart", "Diamond", "Split", "Dots", "Rings"]
let decalToPattern = [0, 9, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20]
let stickerStyles = ["Star", "Skull", "Heart", "Bolt", "Crown", "Flag", "Moon", "Sun", "Rocket", "Jet", "Slime", "Missile", "Gem", "Fire", "Smile", "E"]
let trailStyles = ["Dots", "Line", "Sparkle", "Fire", "Bubbles", "Stars", "Zigzag", "Slime", "Smoke", "Rainbow", "Jet Stream", "Rocket Flame"]
let neonStyles = ["Solid", "Dash", "Dot", "Wave", "Pulse", "Chain", "Sparse", "Morse", "Zip", "Party"]
let topperStyles = ["Antenna", "Spoiler", "Crown", "Siren", "Fin", "Horns", "Halo", "Cannon", "Flag", "Cat Ears", "Mohawk", "Satellite"]
let wingStyles = ["Glider", "Delta", "Bat", "Jet", "Biplane", "Stealth", "Angel", "Dragon"]
let boosterStyles = ["Mini", "Twin", "Triple", "Plasma", "Ion", "Nuclear", "Comet", "Super E"]
let rimStyles = ["Steel", "Chrome", "Spoke", "Star", "Mesh", "Turbo", "Deep", "Split", "Blade", "Gold"]
let exhaustStyles = ["Puff", "Pop", "Flame", "Blue Fire", "Plasma", "Dragon", "Rocket", "Comet"]
let missileStyles = ["Classic", "Shark", "Bullet", "Firework", "Laser", "Slime", "Ice", "Gold", "Star", "Ghost"]
let slimeStyles = ["Goo", "Jelly", "Glitter", "Toxic", "Bubble", "Lava", "Frost", "Rainbow"]
let supplyNames = ["Missiles x10", "Missiles x50", "Nitro Tank", "Shield 10s", "Boost 10s", "Magnet 20s", "Repair Kit", "Rocket Fuel", "Slime Bombs x10", "Coin Bag", "Mega Coin Bag", "Missile Storm x5"]

let ownedList: number[][] = []
let ownAll: boolean[] = []
let equipped: number[][] = []
let shopBuys = 0
let coins = 1000000
let kitPattern = -1          // -1 = no kit pattern

function initShop() {
    ownedList = []
    ownAll = []
    equipped = []
    let c = 0
    while (c < NUM_CATS) {
        ownedList.push([])
        ownAll.push(false)
        equipped.push([])
        c += 1
    }
}

// ---------- infinite coins ----------
function spendCoins(cost: number) {
    if (coins < cost) {
        coins += 1000000       // you are topped up, so you can ALWAYS buy
        popupText("+$1,000,000 INFINITE!", 5)
    }
    coins -= cost
}

function earnCoins(n: number) {
    coins += n
}

function totalShopItems(): number {
    let t = 0
    let c = 0
    while (c < NUM_CATS) {
        t += catSizes[c]
        c += 1
    }
    return t
}

function withCommas(n: number): string {
    let s = "" + Math.floor(n)
    let out = ""
    let count = 0
    let i = s.length - 1
    while (i >= 0) {
        out = s.charAt(i) + out
        count += 1
        if (count % 3 == 0 && i > 0) {
            out = "," + out
        }
        i -= 1
    }
    return out
}

// ---------- counting combinations ----------
// ways to wear 0..k items out of n = C(n,0) + C(n,1) + ... + C(n,k)
function waysToWear(n: number, k: number): number {
    let total = 1
    let term = 1
    let j = 1
    while (j <= k) {
        term = term * (n - j + 1) / j
        total += term
        j += 1
    }
    return total
}

// the number is SO big we count its digits with log10 instead
function comboLog10(): number {
    let sum = 0
    let c = 0
    while (c < FIRST_CONSUMABLE) {
        sum += Math.log(waysToWear(catSizes[c], catStack[c])) / Math.log(10)
        c += 1
    }
    return sum
}

function comboText(): string {
    let L = comboLog10()
    let e = Math.floor(L)
    let m = Math.pow(10, L - e)
    let mm = Math.floor(m * 10) / 10
    return mm + " x 10^" + e
}

// ---------- decoding an index into a real item ----------
function colorOf(id: number): string {
    return colorNames[id % 15]
}

function kitBody(id: number): number { return (id % 15) + 1 }
function kitStripe(id: number): number { return (Math.floor(id / 15) % 15) + 1 }
function kitWheel(id: number): number { return (Math.floor(id / 225) % 15) + 1 }
function kitStyle(id: number): number { return Math.floor(id / 3375) }

function itemName(cat: number, id: number): string {
    let style = Math.floor(id / 15)
    if (cat == CAT_KIT) {
        return kitPatterns[kitStyle(id)] + " " + colorNames[kitBody(id) - 1] + "/" + colorNames[kitStripe(id) - 1] + "/" + colorNames[kitWheel(id) - 1]
    }
    if (cat == CAT_DECAL) { return colorOf(id) + " " + decalStyles[style] }
    if (cat == CAT_STICKER) { return colorOf(id) + " " + stickerStyles[style] + " Sticker" }
    if (cat == CAT_TRAIL) { return colorOf(id) + " " + trailStyles[style] + " Trail" }
    if (cat == CAT_NEON) { return colorOf(id) + " " + neonStyles[style] + " Neon" }
    if (cat == CAT_TOPPER) { return colorOf(id) + " " + topperStyles[style] }
    if (cat == CAT_WINGS) { return colorOf(id) + " " + wingStyles[style] + " Wings" }
    if (cat == CAT_BOOSTER) { return colorOf(id) + " " + boosterStyles[style] + " Booster" }
    if (cat == CAT_RIMS) { return colorOf(id) + " " + rimStyles[style] + " Rims" }
    if (cat == CAT_EXHAUST) { return colorOf(id) + " " + exhaustStyles[style] + " Exhaust" }
    if (cat == CAT_HORN) { return hornName(id) + " Horn" }
    if (cat == CAT_MISSILE_SKIN) { return colorOf(id) + " " + missileStyles[style] + " Missile" }
    if (cat == CAT_SLIME_COLOR) { return colorOf(id) + " " + slimeStyles[style] + " Slime" }
    if (cat == CAT_ROBOT) { return robotName(id) }
    if (cat == CAT_UPGRADE_KIT) { return upgradeNames[id % NUM_UPGRADES] + " Kit Lv" + (Math.floor(id / NUM_UPGRADES) + 1) }
    return supplyNames[id % 12] + (id >= 12 ? " XL" : "")
}

function itemPrice(cat: number, id: number): number {
    if (cat == CAT_UPGRADE_KIT) {
        return upgradeCost(id % NUM_UPGRADES, Math.floor(id / NUM_UPGRADES))
    }
    if (cat == CAT_SUPPLY) {
        return 200 + (id % 12) * 100 + Math.floor(id / 12) * 500
    }
    if (cat == CAT_KIT) {
        return catBasePrice[cat] + kitStyle(id) * 20 + (id % 225)
    }
    return catBasePrice[cat] + Math.floor(id / 15) * 50 + (id % 15) * 5
}

function isOwned(cat: number, id: number): boolean {
    return ownAll[cat] || ownedList[cat].indexOf(id) >= 0
}

function isEquipped(cat: number, id: number): boolean {
    return equipped[cat].indexOf(id) >= 0
}

function equipItem(cat: number, id: number) {
    if (isEquipped(cat, id)) {
        return
    }
    equipped[cat].push(id)
    if (equipped[cat].length > catStack[cat]) {
        equipped[cat].shift()        // oldest one comes off
    }
    if (cat == CAT_KIT) {
        partColor[PART_BODY] = kitBody(id)
        partColor[PART_STRIPE] = kitStripe(id)
        partColor[PART_WHEEL] = kitWheel(id)
        kitPattern = kitStyle(id)
        saveCarAndPaint()
    }
}

// buy (if needed) then wear / take off. Consumables are used right away.
function buyOrEquip(cat: number, id: number) {
    if (cat >= FIRST_CONSUMABLE) {
        spendCoins(itemPrice(cat, id))
        useConsumable(cat, id)
        shopBuys += 1
        buySound()
        return
    }
    if (!isOwned(cat, id)) {
        spendCoins(itemPrice(cat, id))
        ownedList[cat].push(id)
        shopBuys += 1
        buySound()
    }
    if (isEquipped(cat, id)) {
        equipped[cat].removeElement(id)
        if (cat == CAT_KIT) { kitPattern = -1 }
        squishSound()
    } else {
        equipItem(cat, id)
        popSound()
    }
    if (cat == CAT_ROBOT) {
        refreshRobots()
    }
    if (cat == CAT_HORN && isEquipped(cat, id)) {
        playHorn(id)
    }
    rebuildPlayerImages()
}

function useConsumable(cat: number, id: number) {
    if (cat == CAT_UPGRADE_KIT) {
        setUpgradeAtLeast(id % NUM_UPGRADES, Math.floor(id / NUM_UPGRADES) + 1)
        applyStats()
        return
    }
    let k = id % 12
    let xl = 1 + Math.floor(id / 12)
    if (k == 0) { missileAmmo += 10 * xl }
    else if (k == 1) { missileAmmo += 50 * xl }
    else if (k == 2) { nitro = nitroMax }
    else if (k == 3) { shieldUntil = game.runtime() + 10000 * xl }
    else if (k == 4) { boostUntil = game.runtime() + 10000 * xl }
    else if (k == 5) { magnetUntil = game.runtime() + 20000 * xl }
    else if (k == 6) { hp = maxHp }
    else if (k == 7) { rocketFuel = rocketFuelMax }
    else if (k == 8) { slimeBombs += 10 * xl }
    else if (k == 9) { earnCoins(5000 * xl) }
    else if (k == 10) { earnCoins(250000 * xl) }
    else { stormCharges += 5 * xl }
}

// wear a totally random look from EVERY category at once
function randomOutfit() {
    let c = 0
    while (c < FIRST_CONSUMABLE) {
        equipped[c] = []
        let n = 1 + randint(0, catStack[c] - 1)
        let i = 0
        while (i < n) {
            let id = randint(0, catSizes[c] - 1)
            if (!isOwned(c, id)) { ownedList[c].push(id) }
            equipItem(c, id)
            i += 1
        }
        c += 1
    }
    spendCoins(5000)
    rebuildPlayerImages()
    bigPopSound()
}

function unequipAll() {
    let c = 0
    while (c < FIRST_CONSUMABLE) {
        equipped[c] = []
        c += 1
    }
    kitPattern = -1
    rebuildPlayerImages()
    squishSound()
}

function ownedCount(): number {
    let n = 0
    let c = 0
    while (c < NUM_CATS) {
        if (ownAll[c]) { n += catSizes[c] } else { n += ownedList[c].length }
        c += 1
    }
    return n
}

function wearingCount(): number {
    let n = 0
    let c = 0
    while (c < FIRST_CONSUMABLE) {
        n += equipped[c].length
        c += 1
    }
    return n
}

function buyEverything(cat: number) {
    let cost = 0
    if (cat == CAT_KIT) {
        cost = 5000000
    } else {
        let i = 0
        while (i < catSizes[cat]) {
            cost += itemPrice(cat, i)
            i += 1
        }
    }
    spendCoins(cost)
    ownAll[cat] = true
    ownedList[cat] = []
    winFanfare()
}

function shopStatsText(): string {
    return "MEGA SHOP\nItems: " + withCommas(totalShopItems()) +
        "\nOwned: " + withCommas(ownedCount()) +
        "\nWearing now: " + wearingCount() +
        "\nBought: " + shopBuys +
        "\nCoins: $" + withCommas(coins) + " (INFINITE)" +
        "\n\nDifferent looks you can make by stacking:\n" + comboText() +
        "\nThat is WAY more than 10,000,000,000!" +
        "\n(that is a number with " + (Math.floor(comboLog10()) + 1) + " digits!)"
}

function openShop(done: () => void) {
    let items: string[] = []
    let c = 0
    while (c < NUM_CATS) {
        items.push(catNames[c] + " (" + withCommas(catSizes[c]) + ") wear " + (catStack[c] > 50 ? "-" : "" + catStack[c]))
        c += 1
    }
    items.push("RANDOM FULL OUTFIT $5000")
    items.push("Take everything off")
    items.push("Shop stats + combo count")
    showMenu("MEGA SHOP " + withCommas(totalShopItems()) + " items", items, function (pick: number) {
        if (pick < NUM_CATS) {
            openCategory(pick, 0, function () { openShop(done) })
        } else if (pick == NUM_CATS) {
            randomOutfit()
            popupText("NEW LOOK!", 5)
            openShop(done)
        } else if (pick == NUM_CATS + 1) {
            unequipAll()
            openShop(done)
        } else {
            game.showLongText(shopStatsText(), DialogLayout.Full)
            openShop(done)
        }
    }, done)
}

// pages of 20 so menus stay fast. Mega kits have 5,000+ pages so there are
// big jump buttons too.
function openCategory(cat: number, page: number, done: () => void) {
    let per = 20
    let pages = Math.ceil(catSizes[cat] / per)
    if (page < 0) { page = 0 }
    if (page >= pages) { page = pages - 1 }
    let start = page * per
    let end = Math.min(catSizes[cat], start + per)
    let items: string[] = []
    let ids: number[] = []
    if (page > 0) {
        items.push("<< Prev page")
        ids.push(-1)
    }
    if (end < catSizes[cat]) {
        items.push(">> Next page")
        ids.push(-2)
    }
    if (pages > 20) {
        items.push(">>> +10 pages")
        ids.push(-4)
        items.push("<<< -10 pages")
        ids.push(-5)
        items.push(">>>> +100 pages")
        ids.push(-6)
        items.push("?? Random page")
        ids.push(-7)
        items.push("## Type a page number")
        ids.push(-8)
    }
    let i = start
    while (i < end) {
        let mark = "  "
        if (isEquipped(cat, i)) { mark = "* " }
        else if (cat < FIRST_CONSUMABLE && isOwned(cat, i)) { mark = "o " }
        items.push(mark + "#" + i + " " + itemName(cat, i) + " $" + itemPrice(cat, i))
        ids.push(i)
        i += 1
    }
    if (cat < FIRST_CONSUMABLE) {
        items.push("BUY ALL " + catNames[cat])
        ids.push(-3)
    }
    let title = catNames[cat] + " p" + (page + 1) + "/" + pages
    showMenu(title, items, function (pick: number) {
        let id = ids[pick]
        if (id == -1) { openCategory(cat, page - 1, done) }
        else if (id == -2) { openCategory(cat, page + 1, done) }
        else if (id == -4) { openCategory(cat, page + 10, done) }
        else if (id == -5) { openCategory(cat, page - 10, done) }
        else if (id == -6) { openCategory(cat, page + 100, done) }
        else if (id == -7) { openCategory(cat, randint(0, pages - 1), done) }
        else if (id == -8) {
            let n = game.askForNumber("Page 1-" + pages, 4)
            openCategory(cat, Math.floor(n) - 1, done)
        }
        else if (id == -3) {
            buyEverything(cat)
            openCategory(cat, page, done)
        } else {
            buyOrEquip(cat, id)
            openCategory(cat, page, done)
        }
    }, done)
}
