// login.ts - the CAR LOGIN at startup: type a username and a 4-digit GAME PIN.
// The PIN is only for this game (saved with settings). Or play as Guest.
let username = "Guest"

function loginScreen() {
    let saved = settings.exists("se_user") ? settings.readString("se_user") : ""
    if (saved.length > 0) {
        let choice = game.ask("Log in as @" + saved + "?", "A=yes B=new/guest")
        if (choice) {
            let pin = game.askForNumber("4-digit game PIN", 4)
            if (pin == readSave("se_pin", -1)) {
                username = saved
                game.splash("Welcome back", "@" + username + "!")
                bigPopSound()
                return
            }
            errorSound()
            game.splash("Wrong PIN", "playing as Guest")
            username = "Guest"
            return
        }
    }
    let make = game.ask("Make a car login?", "A=yes  B=Guest")
    if (!make) {
        username = "Guest"
        game.splash("Hi Guest!", "Have fun racing")
        return
    }
    let name = game.askForString("Username", 12)
    if (!name || name.length == 0) {
        username = "Guest"
        return
    }
    let p = game.askForNumber("Choose 4-digit game PIN", 4)
    settings.writeString("se_user", name)
    writeSave("se_pin", Math.floor(p))
    username = name
    game.splash("Welcome", "@" + username + "!")
    bigPopSound()
}
