// weather.ts - 10 kinds of weather that change grip and how things look
let weatherNames = ["Sunny", "Rain", "Snow", "Fog", "Sandstorm", "Night", "Neon Rain", "Lava Ash", "Slime Rain", "Thunder"]
let weatherGrips = [1, 0.8, 0.6, 1, 0.85, 1, 0.8, 0.9, 0.75, 0.8]
let weather = 0
let weatherRandom = true
let lastSlimeRain = 0
let lastThunder = 0

function weatherGrip(): number { return weatherGrips[weather] }

function pickWeather() {
    if (weatherRandom) {
        weather = randint(0, 1) == 0 ? trStartWeather[trackId] : randint(0, weatherNames.length - 1)
    }
}

function updateWeather() {
    let now = game.runtime()
    if (weather == 8 && now - lastSlimeRain > 2500) {
        lastSlimeRain = now
        let w = randint(2, NUM_WAYPOINTS - 1)
        dropSlime(wayX[w] + randint(-6, 6), wayY[w] + randint(-6, 6), 7, 6000, false)
    }
    if (weather == 9 && now - lastThunder > 6000) {
        lastThunder = now
        lightningUntil = now + 150
        thunderSound()
    }
}

function drawWeather() {
    let t = game.runtime()
    let i = 0
    if (weather == 1 || weather == 6 || weather == 9) {
        while (i < 30) {
            let x = (i * 37 + Math.floor(t / 8)) % 160
            let y = (i * 53 + Math.floor(t / 4)) % 120
            screen.drawLine(x, y, x - 1, y + 3, weather == 6 ? (i % 4) + 2 : 9)
            i += 1
        }
    } else if (weather == 2) {
        while (i < 30) {
            screen.setPixel((i * 37 + Math.floor(t / 30)) % 160, (i * 53 + Math.floor(t / 15)) % 120, 1)
            i += 1
        }
    } else if (weather == 3 || weather == 5) {
        let c = weather == 3 ? 1 : 15
        while (i < 120) {
            let x = (i * 71) % 160
            let y = (i * 29) % 120
            if (Math.abs(x - player.x) + Math.abs(y - player.y) > 35) {
                screen.fillRect(x, y, 3, 3, c)
            }
            i += 1
        }
    } else if (weather == 4 || weather == 7) {
        while (i < 25) {
            screen.setPixel((i * 41 + Math.floor(t / 5)) % 160, (i * 23) % 120, weather == 4 ? 13 : 15)
            i += 1
        }
    }
    if (t < lightningUntil) {
        screen.drawRect(0, 0, 160, 120, 1)
        screen.drawRect(1, 1, 158, 118, 1)
    }
}

function openWeatherMenu(done: () => void) {
    let items = ["Random weather: " + (weatherRandom ? "ON" : "OFF")]
    let i = 0
    while (i < weatherNames.length) {
        items.push(weatherNames[i] + (i == weather ? " <" : ""))
        i += 1
    }
    showMenu("WEATHER", items, function (pick: number) {
        if (pick == 0) { weatherRandom = !weatherRandom }
        else { weather = pick - 1; weatherRandom = false }
        popSound()
        openWeatherMenu(done)
    }, done)
}
