namespace rogueCubes{
    /*
    =========
    main init
    =========
    */
    // === Global Game State ===
    let playerTeam: Cubeling[] = []
    let ownedCubelings: Cubeling[] = []
    let enemyTeam: Cubeling[] = []
    let activatedCodes: string[] = []
    let money = 0
    let gems = 500
    let difficulty = 1
    let uid = 0
    let teamMenuOpen = false
    let rarityMap: number[][] = [
        [1, 20],
        [4, 100],
        [4, 100],
        [7, 500],
        [10, Infinity]
    ]
    let id = 0

    tiles.setCurrentTilemap(tilemap`level1`)

    // === Cubeling Definition ===
    class Cubeling {
        constructor(
            public name: string,
            public costume: string,
            public maxHealth: number,
            public attack: number,
            public defense: number,
            public speed: number,
            public image: Image,
            public rarity: number,
            uidCount: boolean,
            public rid: number
        ) {
            this.currentHealth = maxHealth
            this.uid = uid
            if (uidCount) uid++
        }
        currentHealth: number
        sprite: Sprite
        alive: boolean = true
        uid: number
        health: StatusBarSprite
        upgradesDamage: number = 1
        upgradesHealth: number = 1
        upgradesDefense: number = 1
        dupe(uidCount: boolean) {
            return new Cubeling(this.name, this.costume, this.maxHealth, this.attack, this.defense, this.speed, this.image, this.rarity, uidCount, this.rid)
        }
    }

    let costumes: { [key: string]: Image } = {
        Fire: img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . 2 2 2 2 2 2 2 2 2 . . .
            . . . . 2 2 2 2 2 2 2 2 2 . . .
            . . . . 2 2 2 2 2 2 2 2 2 . . .
            . . . . 2 2 2 2 2 2 f f f . . .
            . . . . 2 2 2 2 2 2 f f f . . .
            . . . . 2 2 2 2 2 2 f f f . . .
            . . . . 2 2 2 2 2 2 2 2 2 . . .
            . . . . 2 2 2 2 2 2 2 2 2 . . .
            . . . . 2 2 2 2 2 2 2 2 2 . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        `,
        Water: img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . 9 9 9 9 9 9 9 9 9 . . .
    . . . . 9 9 9 9 9 9 9 9 9 . . .
    . . . . 9 9 9 9 9 9 9 9 9 . . .
    . . . . 9 9 9 9 9 9 f f f . . .
    . . . . 9 9 9 9 9 9 f f f . . .
    . . . . 9 9 9 9 9 9 f f f . . .
    . . . . 9 9 9 9 9 9 9 9 9 . . .
    . . . . 9 9 9 9 9 9 9 9 9 . . .
    . . . . 9 9 9 9 9 9 9 9 9 . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`,
        Earth: img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . b b b b b b b b b . . .
    . . . . b b b b b b b b b . . .
    . . . . b b b b b b b b b . . .
    . . . . b b b b b b f f f . . .
    . . . . b b b b b b f f f . . .
    . . . . b b b b b b f f f . . .
    . . . . b b b b b b b b b . . .
    . . . . b b b b b b b b b . . .
    . . . . b b b b b b b b b . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`,
        Basic: img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . 1 1 1 1 1 1 1 1 1 . . .
        . . . . 1 1 1 1 1 1 1 1 1 . . .
        . . . . 1 1 1 1 1 1 1 1 1 . . .
        . . . . 1 1 1 1 1 1 f f f . . .
        . . . . 1 1 1 1 1 1 f f f . . .
        . . . . 1 1 1 1 1 1 f f f . . .
        . . . . 1 1 1 1 1 1 1 1 1 . . .
        . . . . 1 1 1 1 1 1 1 1 1 . . .
        . . . . 1 1 1 1 1 1 1 1 1 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `,
        Lightning: img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . 5 5 5 5 5 5 5 5 5 . . .
        . . . . 5 5 5 5 5 5 5 5 5 . . .
        . . . . 5 5 5 5 5 5 5 5 5 . . .
        . . . . 5 5 5 5 5 5 f f f . . .
        . . . . 5 5 5 5 5 5 f f f . . .
        . . . . 5 5 5 5 5 5 f f f . . .
        . . . . 5 5 5 5 5 5 5 5 5 . . .
        . . . . 5 5 5 5 5 5 5 5 5 . . .
        . . . . 5 5 5 5 5 5 5 5 5 . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `,
    }
    // === Sample Cubeling Pool ===
    let cubelingPool: Cubeling[] = []
    let codes: { [hash: number]: Cubeling } = {
        872877828: new Cubeling("OPGUY", "Lightning", 2000, 500, 4000, 50, costumes["Lightning"], 60, false, -1)
    }
    function addCubelingInternal(name: string, costume: string, maxHealth: number, attack: number, defense: number, speed: number, rarity: number) {
        cubelingPool.push(new Cubeling(name, costume, maxHealth, attack, defense, speed, costumes[costume], rarity, false, id))
        id++
    }

    addCubelingInternal("Basic", "Basic", 80, 15, 5, 40, 1)
    addCubelingInternal("Flame", "Fire", 100, 30, 10, 20, 2)
    addCubelingInternal("Aqua", "Water", 90, 25, 15, 30, 2)
    addCubelingInternal("Rocky", "Earth", 120, 20, 20, 10, 3)
    addCubelingInternal("Thunder", "Lightning", 150, 40, 10, 40, 4)

    function load(){
        if (settings.readJSON("data") != null) {
            let data = JSON.parse(settings.readString("data"))
            playerTeam = jsonToCubelings(data.team, false)
            ownedCubelings = jsonToCubelings(data.owned, true)
            money = data.money
            gems = data.gems
            activatedCodes = data.codes
        } else {
            playerTeam = [
                cubelingPool[0].dupe(true),
                cubelingPool[0].dupe(true),
                cubelingPool[0].dupe(true)
            ]
            ownedCubelings = playerTeam
            money = 0
            gems = 0
        }
    }

    //startGame()

    function simpleHash(str: string): number {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i)
            hash |= 0 // force 32-bit
        }
        return hash
    }

    function cubelingsToJSON(cublings: Cubeling[]) {
        let end: { [key: string]: any }[] = []
        for (let i of cublings) {
            end.push({
                name: i.name,
                costume: i.costume,
                maxHealth: i.maxHealth,
                attack: i.attack,
                defense: i.defense,
                speed: i.speed,
                rarity: i.rarity,
                uid: i.uid,
                rid: i.rid,
                upgradesDamage: i.upgradesDamage,
                upgradesHealth: i.upgradesHealth,
                upgradesDefense: i.upgradesDefense
            })
        }
        return end
    }

    function jsonToCubelings(cublings: { [key: string]: any }[], uidCount: boolean) {
        let end: Cubeling[] = []
        for (let i of cublings) {
            let n = new Cubeling(i.name, i.costume, i.maxHealth, i.attack, i.defense, i.speed, costumes[i.costume], i.rarity, false, i.rid)
            n.uid = i.uid
            if (uidCount) uid = Math.max(uid, i.uid)
            n.upgradesDamage = i.upgradesDamage
            n.upgradesHealth = i.upgradesHealth
            n.upgradesDefense = i.upgradesDefense
            end.push(n)
        }
        return end
    }

    function save() {
        settings.writeString("data", JSON.stringify({ money: money, gems: gems, owned: cubelingsToJSON(ownedCubelings), team: cubelingsToJSON(playerTeam), codes: activatedCodes }))
    }
    /*
    ==================
    battling interface
    ==================
    */
    function battle() {
        scene.setBackgroundImage(img`
        9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
        9999999999999999999999999999999999999999999999999999111111111119999999999999999999999999999999999999991111999999999999999999999999999999999999999999111111111111
        99999999999999999999999999999999999999999999999999991ddddddddd19999999999999999999999999991111199999991dd11999999999999999999999999999999999999999991dddddddddd1
        99999999999999999999999999999911111999999999999999991ddddddddd19999999999999999999999999991ddd199999991ddd1999999999999999999991111999999999999999991dddddddddd1
        9999999999999999999999999999911ddd1199999999999999991d11dddddd19999999999999999999999999111ddd111999911ddd1199999999999999999911dd1199999999999999991dd1d1ddddd1
        999999999999999999999999999911ddddd199999999999999991ddddddd1d199999999111999999111111191ddddddd199991ddddd19999999999999999111dddd199999999999999991dddddd11dd1
        99999911119999999999999999991dddddd199911199999999991ddddddddd1999999911d19999991ddddd191ddddddd199911ddddd119999999999999991dddddd199911119999999991dddddddddd1
        9999991dd19999999999999999991ddd1d119991d199999999991ddddddddd199999991dd19999991ddddd191ddddddd199911ddddd119999999999999991ddd1d119991dd19999999991dddd1ddddd1
        1111111dd19111111991111111111dddddd19111d111999999991ddddddd1d111111111dd19999991ddddd111d11dddd19111ddddddd11111991111111111dddddd19911dd11999999991ddddddd1dd1
        d11dddddd191d1dd1991ddddddddddd1ddd111ddddd1111111111ddddddd1d11d11ddd1dd199999911dd1dd11ddddddd191dddddddddd1dd1991ddddddddddddd1d1111dddd1191111111dddddd11ddd
        dddd1dddd191dddd19911d1dd1ddddddddd111ddddd111dd1dd11ddddddddd11dddd1d1dd11111111dddddd11dd1dddd191ddddddddddddd1991dd1ddd1dddddddd1111dddd1191d11dd1ddddddddddd
        ddddddddd111dd1d1111dddddddddddddddd11dddddd11ddddddddddddddddd1ddddddddd11d11d11ddddddddddddddd191ddddddddddd1d1111dddddddddddddddd11dddddd111ddddddddddddddddd
        d11d1dddd1ddddddd1dd1d1ddddddddddddd11ddddddd1dddd11ddddddddddddd1111ddddddd1ddd11dd1ddddddddddd111ddddddddddddddd1ddd1ddddddddddddd11ddddddd111d11ddddddddddddd
        ddddddddd1ddddddd1dddddddddddddddddddd1dddddd11ddddddddddddddddddddddddddddd1ddd1ddddddddddddddd1d1ddddddddddddddd1dddddddddddddddddddddddddd1dddddddddddddddddd
        cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
        1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111
        11ccccccccccc11cccccccccccc11ccccccccccc11ccccccccccc11cccccccccccc11ccccccccccc11ccccccccccc11cccccccccccc11ccccccccccc11ccccccccccc11cccccccccccc11ccccccccccc
        11cdddddddddc11cddddddddddc11cdddddddddc11cdddddddddc11cddddddddddc11cdddddddddc11cdddddddddc11cddddddddddc11cdddddddddc11cdddddddddc11cddddddddddc11cdddddddddc
        11cdddddddddc11cddddddddddc11cdddddddddc11cdddddddddc11cddddddddddc11cdddddddddc11cdddddddddc11cddddddddddc11cdddddddddc11cdddddddddc11cddddddddddc11cdddddddddc
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd1111111d
        11ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d1111111
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccbccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbcbddbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        1111111dddd11111ddbbbbbbbbbbbbbbbbbdd1111111111dddd11111ddbbbbbbbbbbbbbbbbbdd1111111111dddd11111ddbbbbbbbbbbbbbbbbbdd1111111111dddd11111ddbbbbbbbbbbbbbbbbbdd111
        111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccbbbccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbbcbbcbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbddbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        1111111111dddd11111111111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd1111111d111d1111d111dd11dd
        d11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11d
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd11111111111d1111d111dd11dd1111111111dddd1111111d
        11ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d111111111ddd111111dddd11dd11111111111d1d1111111
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbcccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbccbbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        cccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbc
        bccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccc
        ccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccbbbb
        bbbbccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbddbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbdd1111111111dddd11111ddbbbbbbbbbbbbbbbbbdd1111111111dddd11111ddbbbbbbbbbbbbbbbbbdd1111111111dddd11111ddbbbbbbbbbbbbbbbbbdd1111111111dddd11111ddb
        bbbbbbbbbbbbbbbbbdd11111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11111111111d1d11111ddbbbbbbbbbbbbbbbbbdd11111111111d1d11111dd
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        ccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcc
        dbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbd
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbccbbbbbbbbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcbcbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
        bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    `)
        playerTeam.forEach((value, index) => {
            value.sprite = sprites.create(value.image)
            let statusbar = statusbars.create(10, 1, StatusBarKind.EnemyHealth)
            statusbar.setColor(7, 12, 3)
            statusbar.max = value.maxHealth
            statusbar.value = value.currentHealth
            value.health = statusbar
            value.sprite.x = 62
            value.sprite.y = 60 + (18 * index) - 18
            value.health.x = value.sprite.x
            value.health.y = value.sprite.y - 10
            value.alive = true
        })
        spawnEnemy()
        startBattle()
    }

    function spawnEnemy() {
        enemyTeam = []

        // Filter based on allowed rarities (difficulty gates access)
        const allowed = cubelingPool.filter(c => difficulty >= (c.rid >= 0 ? rarityMap[c.rid][0] : -1) && difficulty <= (c.rid >= 0 ? rarityMap[c.rid][1] : -1))

        // Build weighted pool: each cubeling appears multiple times based on rarity weight
        const weightedPool: Cubeling[] = []
        for (const cub of allowed) {
            const weight = 1 / cub.rarity
            const entries = Math.round(weight * 100) // scale to 100 for precision
            for (let i = 0; i < entries; i++) {
                weightedPool.push(cub)
            }
        }

        for (let i = 0; i < 3; i++) {
            const base = pickCubelingFromPool()
            const cub = base.dupe(false)
            let scaledDifficulty = difficulty - rarityMap[cub.rarity - 1][0]
            // Scale stats based on difficulty
            cub.maxHealth += (scaledDifficulty * 5) - 10
            cub.currentHealth = cub.maxHealth
            cub.attack += (scaledDifficulty * 2) - 4
            cub.defense += scaledDifficulty - 2
            enemyTeam.push(cub)
        }

        // Create sprites and health bars
        enemyTeam.forEach((value, index) => {
            const image = value.image.clone()
            image.flipX()
            value.sprite = sprites.create(image, SpriteKind.Enemy)
            const statusbar = statusbars.create(10, 1, StatusBarKind.Health)
            statusbar.setColor(7, 12, 3)
            statusbar.max = value.maxHealth
            statusbar.value = value.currentHealth
            value.health = statusbar
            value.sprite.x = 98
            value.sprite.y = 60 + (18 * index) - 18
            value.health.x = value.sprite.x
            value.health.y = value.sprite.y - 10
        })
    }

    function getCubelingWeight(cub: Cubeling, difficulty: number, rarityMap: number[][]): number {
        let rarity = cub.rarity
        let minDiff = rarityMap[rarity - 1][0]
        let maxDiff = rarityMap[rarity - 1][1]

        // Outside allowed range → 0 weight
        if (difficulty < minDiff || difficulty > maxDiff) return 0

        // Map difficulty within [minDiff, maxDiff] to [low%, 100%]
        // Low% at minDiff, ramps up to 100% at maxDiff
        let lowPercent = 0.1 // you can tweak this
        if (maxDiff == minDiff) return 1 // special case: constant 100%

        let t = (difficulty - minDiff) / (maxDiff - minDiff) // 0 → 1
        let weight = lowPercent + t * (1 - lowPercent)

        return weight
    }

    function pickCubelingFromPool(): Cubeling {
        let weights: number[] = []
        let totalWeight = 0
        for (let cub of cubelingPool) {
            let w = getCubelingWeight(cub, difficulty, rarityMap)
            weights.push(w)
            totalWeight += w
        }

        let r = Math.random() * totalWeight
        let acc = 0
        for (let i = 0; i < cubelingPool.length; i++) {
            acc += weights[i]
            if (r < acc) return cubelingPool[i]
        }
        return cubelingPool[0] // fallback
    }

    function quickBattle() {
        let totalEnemyStats = { attack: 0, health: 0, defense: 0 }
        let totalPlayerStats = { attack: 0, health: 1, defense: 0 }
        let inMon = 0
        let inGem = 0
        while (totalPlayerStats.health > 0) {
            if (difficulty == 1) {
                totalPlayerStats.health -= 1
            }
            enemyTeam = []

            // Filter based on allowed rarities (difficulty gates access)
            const allowed = cubelingPool.filter(c => difficulty >= (c.rid >= 0 ? rarityMap[c.rid][0] : -1) && difficulty <= (c.rid >= 0 ? rarityMap[c.rid][1] : -1))

            // Build weighted pool: each cubeling appears multiple times based on rarity weight
            const weightedPool: Cubeling[] = []
            for (const cub of allowed) {
                const weight = 1 / cub.rarity
                const entries = Math.round(weight * 100) // scale to 100 for precision
                for (let i = 0; i < entries; i++) {
                    weightedPool.push(cub)
                }
            }

            for (let i = 0; i < 3; i++) {
                const base = pickCubelingFromPool()
                const cub = base.dupe(false)
                let scaledDifficulty = difficulty - rarityMap[cub.rarity - 1][0]
                // Scale stats based on difficulty
                cub.maxHealth += (scaledDifficulty * 5) - 10
                cub.currentHealth = cub.maxHealth
                cub.attack += (scaledDifficulty * 2) - 4
                cub.defense += scaledDifficulty - 2
                enemyTeam.push(cub)
            }

            enemyTeam.forEach(v => { totalEnemyStats.attack += v.attack; totalEnemyStats.health += v.maxHealth; totalEnemyStats.defense += v.defense })

            playerTeam.forEach(v => { totalPlayerStats.attack += v.attack; totalPlayerStats.health += v.maxHealth; totalPlayerStats.defense += v.defense })
            let playerTurn = false
            while (totalEnemyStats.health > 0 && totalPlayerStats.health > 0) {
                if (playerTurn) {
                    totalEnemyStats.health -= totalPlayerStats.attack - totalEnemyStats.defense < 5 ? Math.round(totalPlayerStats.attack / totalEnemyStats.defense) : totalPlayerStats.attack - totalEnemyStats.defense
                } else {
                    totalPlayerStats.health -= totalEnemyStats.attack - totalPlayerStats.defense < 5 ? Math.round(totalEnemyStats.attack / totalPlayerStats.defense) : totalEnemyStats.attack - totalPlayerStats.defense
                }
                playerTurn = !playerTurn
            }
            if (totalPlayerStats.health > 0) {
                difficulty++
                money += Math.ceil(difficulty / 100)
                inMon += Math.ceil(difficulty / 10)
                gems += Math.ceil(Math.floor(difficulty / 10) / 10)
                inGem += Math.ceil(Math.floor(difficulty / 10) / 10)
            }
        }
        save()
        game.splash("Money: " + inMon + ", Gems: " + inGem, "Level Reached: " + difficulty)
        game.reset()
    }

    // === Battle Loop ===
    function startBattle() {
        let playerTurn = true
        let playerIndex = 0
        let enemyIndex = 0
        playerTeam.sort((a, b) => b.speed - a.speed)
        enemyTeam.sort((a, b) => b.speed - a.speed)
        // Simplified Turn-Based System (one Cubeling each)
        while (playerTeam.some(v => v.alive) && enemyTeam.some(v => v.alive)) {
            if (playerTurn) {
                let aliveDefender = enemyTeam.filter(val => val.alive)
                let aliveAttacker = playerTeam.filter(val => val.alive)
                dealDamage(aliveAttacker[playerIndex], aliveDefender[randint(0, aliveDefender.length - 1)])
                aliveDefender = enemyTeam.filter(val => val.alive)
                playerIndex++
                playerIndex %= aliveAttacker.length
                enemyIndex %= aliveDefender.length
            } else {
                let aliveDefender = playerTeam.filter(val => val.alive)
                let aliveAttacker = enemyTeam.filter(val => val.alive)
                dealDamage(aliveAttacker[enemyIndex], aliveDefender[randint(0, aliveDefender.length - 1)])
                aliveDefender = playerTeam.filter(val => val.alive)
                enemyIndex++
                enemyIndex %= aliveAttacker.length
                playerIndex %= aliveDefender.length
            }
            playerTurn = !playerTurn
        }
        endBattle()
    }

    function dealDamage(attacker: Cubeling, defender: Cubeling) {
        let damage = attacker.attack - defender.defense < 5 ? Math.round(attacker.attack / defender.defense) : attacker.attack - defender.defense
        if (damage < 0) damage = 0
        defender.currentHealth -= damage
        let pos = { x: attacker.sprite.x, y: attacker.sprite.y }
        story.spriteMoveToLocation(attacker.sprite, attacker.sprite.x > defender.sprite.x ? defender.sprite.x + 16 : defender.sprite.x - 16, defender.sprite.y, attacker.speed * 2)
        let text = textsprite.create("-" + damage, 0, 2)
        text.x = attacker.sprite.x > defender.sprite.x ? defender.sprite.x - 20 : defender.sprite.x + 20
        text.y = defender.sprite.y
        defender.health.value = defender.currentHealth
        defender.health.setColor(defender.currentHealth > (defender.maxHealth * 3 / 4) ? 7 : defender.currentHealth > (defender.maxHealth * 2 / 4) ? 5 : defender.currentHealth > (defender.maxHealth / 4) ? 4 : 2, 12, 3)
        if (defender.currentHealth <= 0) {
            defender.alive = false
            text.setText("X")
            text.x = attacker.sprite.x > defender.sprite.x ? defender.sprite.x - 20 : defender.sprite.x + 20
        } else {
            timer.after(500, function () {
                sprites.destroy(text)
            })
        }
        story.spriteMoveToLocation(attacker.sprite, pos.x, pos.y, attacker.speed * 2)
    }

    // === End Battle and Reward ===
    function endBattle() {
        let playerWins = !enemyTeam.some(v => v.alive)
        if (playerWins) {
            pause(700)
            money += Math.ceil(difficulty / 10)
            gems += Math.floor(Math.pow(difficulty, 0.5))
            save()
            difficulty += 1
            // Heal Cubelings
            for (let c of playerTeam) {
                c.currentHealth = c.maxHealth
                c.health.value = c.currentHealth
                c.health.setColor(7, 12, 3)
                c.alive = true
            }
            for (let e of enemyTeam) {
                e.health.destroy()
                e.sprite.destroy()
            }
            sprites.allOfKind(SpriteKind.Text).forEach(v => {
                sprites.destroy(v)
                pause(1)
            })
            spawnEnemy()
            startBattle()
        } else {
            save()
            game.gameOver(false)
        }
    }
    /*
    =================
    menu/start screen
    =================
    */
    function openTeamSelectMenu() {
        teamMenuOpen = true
        let page = 0
        let selected: Cubeling[] = []
        for (let i = 0; i < ownedCubelings.length; i++) {
            if (i < 70) {
                let newSprite = sprites.create(ownedCubelings[i].image, SpriteKind.Projectile)
                let row = Math.floor(i / 10)
                let column = i % 10
                grid.place(newSprite, tiles.getTileLocation(column, row))
            }
        }
        let mySprite = sprites.create(img`
        5 5 5 5 . . . . . . . . 5 5 5 5
        5 . . . . . . . . . . . . . . 5
        5 . . . . . . . . . . . . . . 5
        5 . . . . . . . . . . . . . . 5
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        5 . . . . . . . . . . . . . . 5
        5 . . . . . . . . . . . . . . 5
        5 . . . . . . . . . . . . . . 5
        5 5 5 5 . . . . . . . . 5 5 5 5
    `, SpriteKind.Player)
        grid.place(mySprite, tiles.getTileLocation(0, 0))
        grid.moveWithButtons(mySprite)
        controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
            if (teamMenuOpen && grid.spriteCol(mySprite) == 9 && ownedCubelings.length > 70 * page) {
                sprites.allOfKind(SpriteKind.Projectile).forEach(v => sprites.destroy(v))
                let curLings = ownedCubelings.slice(page * 70 - 1, Math.min(ownedCubelings.length - 1, page * 70 + 69))
                for (let i = 0; i < curLings.length; i++) {
                    if (i < 70) {
                        let newSprite = sprites.create(curLings[i].image)
                        let row = Math.floor(i / 10)
                        let column = i % 10
                        grid.place(newSprite, tiles.getTileLocation(column, row))
                    }
                }
            } else if (grid.spriteCol(mySprite) < 9) {
                grid.move(mySprite, 1, 0)
            }
        })
        controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
            let hovered = grid.spriteCol(mySprite) + (grid.spriteRow(mySprite) * 10) + (page * 70)
            if (teamMenuOpen && ownedCubelings.length > hovered) {
                if (selected.indexOf(ownedCubelings[hovered]) == -1) {
                    selected.push(ownedCubelings[hovered])
                    let selectedIndicator = sprites.create(img`
                    3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 . . . . . . . . . . . . . . 3
                    3 3 3 3 3 3 3 3 3 3 3 3 3 3 3 3
                `, SpriteKind.Food)
                    selectedIndicator.z = mySprite.z - 1
                    grid.place(selectedIndicator, tiles.getTileLocation(grid.spriteCol(mySprite), grid.spriteRow(mySprite)))
                    if (selected.length == 3) {
                        sprites.allOfKind(SpriteKind.Projectile).forEach(v => sprites.destroy(v))
                        sprites.allOfKind(SpriteKind.Food).forEach(v => sprites.destroy(v))
                        sprites.destroy(mySprite)
                        playerTeam = selected
                        startGame()
                    }
                } else {
                    selected.removeElement(ownedCubelings[hovered])
                    grid.getSprites(tiles.getTileLocation(grid.spriteCol(mySprite), grid.spriteRow(mySprite))).filter(v => v.kind() == SpriteKind.Food).forEach(v => v.destroy())
                }
            }
        })
    }

    // === Start Game ===
    function startGame() {
        story.showPlayerChoices("Shop", "Battle", "Equip", "More")
        while (story.isMenuOpen()) {
            pause(1)
        }
        if (story.getLastAnswer() == "Battle") {
            battle()
        } else if (story.getLastAnswer() == "Shop") {
            let textSprite = textsprite.create(money.toString())
            textSprite.setIcon(img`
            . 5 5 5 .
            5 4 5 5 5
            5 5 4 5 5
            5 4 4 4 5
            . 5 5 5 .
        `)
            textSprite.y = 30
            textSprite.x = 80
            let textSprite2 = textsprite.create(gems.toString())
            textSprite2.setIcon(img`
            . . . . .
            9 9 9 9 9
            . 9 9 9 .
            . . 9 . .
            . . . . .
        `)
            textSprite2.y = 19
            textSprite2.x = 80
            pause(1)
            shopping(textSprite, textSprite2)
        } else if (story.getLastAnswer() == "Equip") {
            openTeamSelectMenu()
        } else if (story.getLastAnswer() == "More") {
            story.showPlayerChoices("Quick Battle", "Reset Data", "Enter Code", "Back")
            while (story.isMenuOpen()) {
                pause(1)
            }
            if (story.getLastAnswer() == "Quick Battle") {
                quickBattle()
            } else if (story.getLastAnswer() == "Reset Data") {
                if (game.ask("Are you sure you want to do this?", "This action cannot be undone")) {
                    settings.remove("data")
                    game.reset()
                } else {
                    startGame()
                }
            } else if (story.getLastAnswer() == "Enter Code") {
                let code = game.askForString("Code", 20, false)
                if (codes[simpleHash(code)] && activatedCodes.indexOf(code) == -1) {
                    activatedCodes.push(code)
                    ownedCubelings.push(codes[simpleHash(code)].dupe(true))
                }
                startGame()
            } else if (story.getLastAnswer() == "Back") {
                startGame()
            }
        }
    }

    function shopping(mone: TextSprite, jems: TextSprite) {
        story.showPlayerChoices("Upgrade", "Recruit", "Back")
        while (story.isMenuOpen()) {
            pause(1)
        }
        if (story.getLastAnswer() == "Recruit") {
            recruitCubeling(mone, jems)
        } else if (story.getLastAnswer() == "Upgrade") {
            selectUpgrades(mone, jems)
        } else {
            sprites.destroy(mone)
            sprites.destroy(jems)
            startGame()
        }
    }

    function selectUpgrades(mone: TextSprite, jems: TextSprite) {
        story.showPlayerChoices(playerTeam[0].name + " #" + playerTeam[0].uid, playerTeam[1].name + " #" + playerTeam[1].uid, playerTeam[2].name + " #" + playerTeam[2].uid, "Back")
        while (story.isMenuOpen()) {
            pause(1)
        }
        let ansInx: number
        if (story.getLastAnswer() == playerTeam[0].name + " #" + playerTeam[0].uid) ansInx = 0
        else if (story.getLastAnswer() == playerTeam[1].name + " #" + playerTeam[1].uid) ansInx = 1
        else if (story.getLastAnswer() == playerTeam[2].name + " #" + playerTeam[2].uid) ansInx = 2
        else shopping(mone, jems)
        upgrades(ansInx, mone, jems)
    }

    function upgrades(ansInx: number, mone: TextSprite, jems: TextSprite) {
        let teamAns = playerTeam[ansInx]
        let moneyCalc = (a: number) => (5 * a * teamAns.rarity) + a
        story.showPlayerChoices(
            "Damage: " + teamAns.upgradesDamage + ", $" + (moneyCalc(teamAns.upgradesDamage)),
            "Health: " + teamAns.upgradesHealth + ", $" + (moneyCalc(teamAns.upgradesHealth)),
            "Defense: " + teamAns.upgradesDefense + ", $" + (moneyCalc(teamAns.upgradesDefense)),
            "Back"
        )
        while (story.isMenuOpen()) {
            pause(1)
        }
        if (story.getLastAnswer() == "Damage: " + teamAns.upgradesDamage + ", $" + (moneyCalc(teamAns.upgradesDamage))) {
            if (money >= moneyCalc(teamAns.upgradesDamage)) {
                money -= moneyCalc(teamAns.upgradesDamage)
                teamAns.upgradesDamage++
                teamAns.attack += 5
                mone.setText(money + "")
            }
            upgrades(ansInx, mone, jems)
        } else if (story.getLastAnswer() == "Health: " + teamAns.upgradesHealth + ", $" + (moneyCalc(teamAns.upgradesHealth))) {
            if (money >= moneyCalc(teamAns.upgradesHealth)) {
                money -= moneyCalc(teamAns.upgradesHealth)
                teamAns.upgradesHealth++
                teamAns.maxHealth += 10
                teamAns.currentHealth = teamAns.maxHealth
                mone.setText(money + "")
            }
            upgrades(ansInx, mone, jems)
        } else if (story.getLastAnswer() == "Defense: " + teamAns.upgradesDefense + ", $" + (moneyCalc(teamAns.upgradesDefense))) {
            if (money >= moneyCalc(teamAns.upgradesDefense)) {
                money -= moneyCalc(teamAns.upgradesDefense)
                teamAns.upgradesDefense++
                teamAns.defense += 5
                mone.setText(money + "")
            }
            upgrades(ansInx, mone, jems)
        } else {
            selectUpgrades(mone, jems)
        }
    }

    // === Recruit Menu ===
    function recruitCubeling(mone: TextSprite, jems: TextSprite) {
        if (gems < 500) {
            game.splash("Not enough gems!")
            shopping(mone, jems)
            return
        }

        gems -= 500

        // Build weighted list dynamically
        let weightedList: Cubeling[] = []
        for (let c of cubelingPool) {
            let weight = 1 / c.rarity
            let count = Math.round(weight * 100) // Scale for precision
            for (let i = 0; i < count; i++) {
                weightedList.push(c)
            }
        }

        let selected = weightedList[Math.randomRange(0, weightedList.length - 1)].dupe(true)
        ownedCubelings.push(selected)

        game.splash(`Recruited ${selected.name}!`)
        jems.setText(gems.toString())
        jems.x = 80
        shopping(mone, jems)
    }

    /*
    =============================
    Public stuff for future packs
    =============================
    */
    //%block
    export function start(){
        load()
        startGame()
    }
    //%block="make new cubeling '$name' with costume $costumeImg named $costume and maxHealth: $maxHealth, damage: $attack, defense: $defense, speed: $speed, rarity: $rarity, minimum difficulty appearance: $minLvlAppearance, maximum difficulty appearance: $maxLvlAppearance"
    //%costumeImg.shadow='screen_image_picker'
    export function addCubeling(name: string, costumeImg: Image, costume: string, maxHealth: number, attack: number, defense: number, speed: number, rarity: number, minLvlAppearance: number, maxLvlAppearance: number) {
        costumes[costume] = costumeImg
        addCubelingInternal(name, costume, maxHealth, attack, defense, speed, rarity)
        rarityMap.push([minLvlAppearance, maxLvlAppearance])
    }
    //%block
    export function importBundle(data: string){
        function convertBase(value: string, from_base: number, to_base: number): string {
            const range = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/";
            const from_range = range.substr(0, from_base);
            const to_range = range.substr(0, to_base);

            // Convert input string to an array of digit values (base from_base)
            let digits: number[] = [];
            for (let i = 0; i < value.length; i++) {
                const ch = value.charAt(i);
                const val = from_range.indexOf(ch);
                if (val < 0) {
                    game.splash("Invalid digit: " + ch);
                    return "";
                }
                digits.push(val);
            }

            // Conversion algorithm (repeated division method)
            let output: number[] = [];
            while (digits.length > 0) {
                let remainder = 0;
                let newDigits: number[] = [];

                for (let i = 0; i < digits.length; i++) {
                    let acc = digits[i] + remainder * from_base;
                    let digit = Math.idiv(acc, to_base);
                    remainder = acc % to_base;
                    if (newDigits.length > 0 || digit != 0) {
                        newDigits.push(digit);
                    }
                }
                output.unshift(remainder);
                digits = newDigits;
            }

            // Map output digit values to characters
            let result = "";
            for (let i = 0; i < output.length; i++) {
                result += to_range.charAt(output[i]);
            }

            return result.length > 0 ? result : "0";
        }
        let edata = convertBase(data, 62, 10)
        let splitBy3: string[] = []
        let id = ""
        edata.split('').forEach(v=>{
            id+=v
            if(id.length == 3){
                splitBy3.push(id)
                id=""
            }
        })
        let final = ""
        splitBy3.forEach(v=>final+=String.fromCharCode(parseInt(v)))
        let lines = final.split("/")
        let attrs: string[][] = []
        lines.forEach(v=>{
            let r: string[] = []
            v.split("|").forEach(d=>{
                r.push(d)
            })
            attrs.push(r)
        })
        attrs.forEach(v=>{
            let fin = image.create(16, 16)
            let imag = convertBase(v[1], 62, 17)
            imag.split('g').forEach((v,i1)=>{
                v.split('').forEach((d,i2)=>{
                    let newd = d.replace("a", "10").replace("b", "11").replace("c", "12").replace("d", "13").replace("e", "14").replace("f", "-1")
                    fin.setPixel(i2, i1, parseInt(newd)+1)
                })
            })
            addCubeling(v[0], fin, v[2], parseInt(v[3]), parseInt(v[4]), parseInt(v[5]), parseInt(v[6]), parseInt(v[7]), parseInt(v[8]), parseInt(v[9]))
        })
    }
}
img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`