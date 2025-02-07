import { Card } from "./enum/cards/Card";
import { Type } from "./enum/cards/CardType";
import { Deck } from "./enum/Deck";
import { Edition, EditionItem } from "./enum/Edition";
import { PackKind } from "./enum/packs/PackKind";
import { Stake } from "./enum/Stake";
import { Version } from "./enum/Version";
import { Game } from "./Game";
import { AnalysisParams } from "./interface/AnalysisParams";
import { Configurations } from "./interface/Configurations";
import { ItemImpl } from "./interface/Item";
import { Run } from "./Run";
import { AbstractCard } from "./struct/AbstractCard";
import { CardNameBuilder } from "./struct/CardNameBuilder";
import { InstanceParams } from "./struct/InstanceParams";
import { JokerData } from "./struct/JokerData";
import { JokerStickers } from "./struct/JokerStickers";
import { Option } from "./struct/Option";

export class BalatroAnalyzer {
    static readonly OPTIONS: ReadonlyArray<string> = [
        // Tags
        "Negative Tag",
        "Foil Tag",
        "Holographic Tag",
        "Polychrome Tag",
        "Rare Tag",

        // Special Cards
        "Golden Ticket",

        // Characters
        "Mr. Bones",
        "Acrobat",
        "Sock and Buskin",
        "Swashbuckler",
        "Troubadour",

        // Items & Certificates
        "Certificate",
        "Smeared Joker",
        "Throwback",
        "Hanging Chad",

        // Gems & Materials
        "Rough Gem",
        "Bloodstone",
        "Arrowhead",
        "Onyx Agate",
        "Glass Joker",

        // Performance & Entertainment
        "Showman",
        "Flower Pot",
        "Blueprint",
        "Wee Joker",
        "Merry Andy",

        // Special Effects
        "Oops! All 6s",
        "The Idol",
        "Seeing Double",
        "Matador",
        "Hit the Road",

        // Card Sets
        "The Duo",
        "The Trio",
        "The Family",
        "The Order",
        "The Tribe",

        // Special Characters
        "Stuntman",
        "Invisible Joker",
        "Brainstorm",
        "Satellite",
        "Shoot the Moon",

        // Licenses & Professions
        "Driver's License",
        "Cartomancer",
        "Astronomer",
        "Burnt Joker",
        "Bootstraps",

        // Shop & Economy
        "Overstock Plus",
        "Liquidation",
        "Glow Up",
        "Reroll Glut",
        "Omen Globe",

        // Tools & Equipment
        "Observatory",
        "Nacho Tong",
        "Recyclomancy",

        // Merchants
        "Tarot Tycoon",
        "Planet Tycoon",

        // Special Items
        "Money Tree",
        "Antimatter",
        "Illusion",
        "Petroglyph",
        "Retcon",
        "Palette"
    ] as const;
    // seed: string;
    ante: number;
    cardsPerAnte: number[];
    deck: Deck;
    stake: Stake;
    version: Version;
    configurations: Configurations;


    constructor(ante: number, cardsPerAnte: number[], deck: Deck, stake: Stake, version: Version, configurations: Configurations) {
        // this.seed = seed;
        this.ante = ante;
        this.cardsPerAnte = cardsPerAnte;
        this.deck = deck;
        this.stake = stake;
        this.version = version;
        this.configurations = configurations;
    }

    performAnalysis({ seed, ante, cardsPerAnte, deck, stake, version }: AnalysisParams) {
        const selectedOptions: boolean[] = new Array(61).fill(true);

        const game = new Game(seed, new InstanceParams(deck, stake, false, version.getVersion()));
        game.initLocks(1, false, false);

        game.firstLock();

        for (let i = 0; i < BalatroAnalyzer.OPTIONS.length; i++) {
            if (!selectedOptions[i]) game.lock(BalatroAnalyzer.OPTIONS[i]);
        }

        game.setDeck(deck);

        const run = new Run(seed);

        for (let a = 1; a <= ante; a++) {
            game.initUnlocks(a, false);
            // console.log(`Ante ${a}:`);
            // console.log(` Boss: ${game.nextBoss(a).getName()}`);

            //voucher
            const voucher = game.nextVoucher(a).getName();
            // console.log(` Voucher ${voucher}`)

            game.lock(voucher);

            for (let i = 0; i < Game.VOUCHERS.length; i += 2) {
                if (Game.VOUCHERS[i].getName() === voucher) {
                    if (selectedOptions[BalatroAnalyzer.OPTIONS.indexOf(Game.VOUCHERS[i + 1].getName())]) {
                        game.unlock(Game.VOUCHERS[i + 1].getName());
                    }
                }
            }

            // console.log(` tags: ${game.nextTag(a).getName()}, ${game.nextTag(a).getName()}`);

            for (let i = 0; i < cardsPerAnte[a - 1]; i++) {
                const shopItem = game.nextShopItem(a);
                let sticker: Edition | null = null;
                if (shopItem.type === Type.JOKER) {
                    run.addJoker(shopItem.jokerData.joker.getName());
                    if (shopItem.jokerData.stickers.eternal) sticker = Edition.ETERNAL;
                    if (shopItem.jokerData.stickers.perishable) sticker = Edition.PERISHABLE;
                    if (shopItem.jokerData.stickers.rental) sticker = Edition.RENTAL;
                    if (shopItem.jokerData.edition !== Edition.NO_EDITION) sticker = shopItem.jokerData.edition;
                }

                // console.log(` Card ${i + 1}: ${shopItem.item.getName()} ${sticker ? `(${new EditionItem(sticker).getName()})` : ""}`);
            }

            const numPacks = a === 1 ? 4 : 6;

            for (let p = 1; p <= numPacks; p++) {
                const pack = game.nextPack(a);
                const packInfo = game.packInfo(pack);
                const options = new Set<Option>();

                let cards;
                switch (packInfo.getKind()) {
                    case PackKind.CELESTIAL:
                        cards = game.nextCelestialPack(packInfo.getSize(), a);
                        break;
                    case PackKind.ARCANA:
                        cards = game.nextArcanaPack(packInfo.getSize(), a);
                        break;
                    case PackKind.SPECTRAL:
                        cards = game.nextSpectralPack(packInfo.getSize(), a);
                        break;
                    case PackKind.BUFFOON:
                        cards = game.nextBuffoonPack(packInfo.getSize(), a);
                        break;
                    case PackKind.STANDARD:
                        cards = game.nextStandardPack(packInfo.getSize(), a);
                        break;

                }

                for (let c = 0; c < packInfo.getSize(); c++) {
                    if (packInfo.getKind() == PackKind.BUFFOON) {
                        const joker: JokerData = cards[c] as JokerData;
                        const sticker = BalatroAnalyzer.getSticker(joker as JokerData);
                        run.addJoker(joker.joker.getName());
                        options.add(new Option(joker.joker, new ItemImpl(sticker)));
                        continue;
                    } else if (packInfo.getKind() == PackKind.STANDARD) {
                        const card: Card = cards[c] as Card;
                        const cardName = new CardNameBuilder(card).build();
                        options.add(new Option(new AbstractCard(cardName), new ItemImpl(Edition.NO_EDITION)));
                        continue;
                    }

                    if ((cards[c] as ItemImpl).getName() === "The Soul") {
                        run.hasTheSoul = true;
                    }
                    options.add(new Option(cards[c] as ItemImpl, new ItemImpl(Edition.NO_EDITION)));
                }

                // console.log(` Pack ${p}: ${packInfo.getKind()}`);
                // console.log(`  Options:`);
                // for (const option of options) {

                //     console.log(`-   ${option.name.getName()}`);
                // }
            }
        }
        return run;
    }

    private static getSticker(joker: JokerData): string {
        let sticker: string | null = null;

        if (joker.stickers.eternal) {
            sticker = Edition.ETERNAL;
        }
        if (joker.stickers.perishable) {
            sticker = Edition.PERISHABLE;
        }
        if (joker.stickers.rental) {
            sticker = Edition.RENTAL;
        }

        if (joker.edition !== Edition.NO_EDITION) {
            sticker = joker.edition;
        }

        return sticker || Edition.NO_EDITION;
    }
}