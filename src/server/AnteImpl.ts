import { Ante } from './interface/Ante';
import { Game } from './Game';
import { ShopQueue } from './struct/ShopQueue';
import { Tag } from './enum/Tag';
import { Voucher } from './enum/Voucher';
import { BossBlind as Boss, BossBlindEnum } from './enum/BossBlind';
import { PackInfo } from './struct/PackInfo';
import { ItemImpl } from './interface/Item';
import { Edition } from './enum/Edition';
import { ShopItem } from './struct/ShopItem';
import { SearchableItem } from './struct/SearchableItem';
import { PackType } from './enum/packs/PackType';
import { PackKind } from './enum/packs/PackKind';
import { Option } from './struct/Option';
import { Specials } from './enum/cards/Specials';
import { LegendaryJoker } from './enum/cards/LegendaryJoker';
import { RareJoker } from './enum/cards/RareJoker';
import { UncommonJoker } from './enum/cards/UncommonJoker';
import { CommonJoker } from './enum/cards/CommonJoker';
import { JokerImpl } from './interface/Joker';
import { Tarot } from './enum/cards/Tarot';
import { Planet, PlanetItem } from './enum/cards/Planet';

export class AnteImpl implements Ante {
    private legendaryJokers: Set<string> | null = null;
    private readonly shop: Set<string> = new Set();
    private readonly tags: Set<Tag> = new Set();
    private readonly packInfos: PackInfo[] = [];
    private voucher?: Voucher;
    private boss?: BossBlindEnum;

    constructor(
        private readonly ante: number,
        private readonly game: Game,
        private readonly shopQueue: ShopQueue = new ShopQueue()
    ) { }

    hasBoss(boss: BossBlindEnum): boolean {
        return this.boss === boss;
    }

    hasInShop(item: ItemImpl, index?: number): boolean {
        if (index == null) {
            return this.shop.has(item.getName());
        }

        if (index > this.shopQueue.length) {
            return false;
        }

        for (let i = 0; i < index; i++) {
            if (this.shopQueue[i].equals(item)) {
                return true;
            }
        }

        return false;
    }

    countLegendary(): number {
        this.hasLegendary(LegendaryJoker.PERKEO);
        return this.legendaryJokers?.size || 0;
    }

    addTag(tag: Tag): void {
        this.tags.add(tag);
    }

    addToQueue(value: ShopItem, sticker: Edition): void {
        this.shop.add(value.item.getName());
        this.shopQueue.push(new SearchableItem(value.item, sticker));
    }

    setBoss(boss: Boss): void {
        this.boss = boss;
    }

    setVoucher(voucher: Voucher): void {
        this.voucher = voucher;
    }

    addPack(packInfo: PackInfo, options: Set<Option>): void {
        packInfo.setOptions(options);
        this.packInfos.push(packInfo);
    }

    getLegendaryJokers(): Set<string> {
        this.hasLegendary(LegendaryJoker.PERKEO); // pre-compute
        return new Set(this.legendaryJokers);
    }

    getBufferedJokerCount(): number {
        return this.shopQueue.filter(item => item.hasSticker() && item.getItem() instanceof JokerImpl).length;
    }

    getScore(): number {
        let score = 0;
        score += this.countLegendary() * 5;

        if (this.hasLegendary(LegendaryJoker.YORICK) || this.hasLegendary(LegendaryJoker.CANIO)) {
            score -= 5;
        }

        if (this.hasInShop(RareJoker.BLUEPRINT)) {
            score += 1.5;
        }

        if (this.hasInShop(RareJoker.BRAINSTORM)) {
            score += 1.5;
        }

        if (this.hasInShop(UncommonJoker.SHOWMAN)) {
            score += 0.5;
        }

        if (this.hasInShop(UncommonJoker.CONSTELLATION)) {
            score += 1.0;
        }

        if (this.hasInShop(RareJoker.INVISIBLE_JOKER)) {
            score += 1;
        }

        if (this.hasInShop(UncommonJoker.SOCK_AND_BUSKIN)) {
            if (this.hasLegendary(LegendaryJoker.TRIBOULET)) {
                score += 2.0;
            } else {
                score += 0.5;
            }
        }

        if (this.hasInShop(CommonJoker.HANGING_CHAD)) {
            if (this.hasLegendary(LegendaryJoker.TRIBOULET)) {
                score += 1.0;
            } else {
                score += 0.5;
            }
        }

        if (this.hasInShop(CommonJoker.FORTUNE_TELLER)) {
            score += 0.3;
        }

        if (this.hasInShop(RareJoker.DNA)) {
            score += 0.5;
        }

        score += this.shopQueue.filter(item => item.hasSticker()).length * 0.5;
        score += this.shopQueue.filter(item => item.hasEdition(Edition.NEGATIVE)).length * 1.0;
        score += this.packInfos.filter(pack => pack.getKind() === PackKind.SPECTRAL).length * 0.3;

        for (const tag of this.tags) {
            if (tag === Tag.NEGATIVE_TAG) {
                score += 1.5;
            }

            if (tag === Tag.CHARM_TAG) {
                score += 0.5;
            }
        }

        if (this.boss === Boss.THE_ARM) {
            score -= 0.5;
        }

        if (this.hasInPack(Specials.BLACKHOLE)) {
            score += 2.0;
        }

        if (this.voucher === Voucher.BLANK) {
            score -= 1.0;
        }

        if (this.voucher === Voucher.CLEARANCE_SALE) {
            score += 0.5;
        }

        if (this.voucher === Voucher.OVERSTOCK) {
            score += 0.2;
        }

        if (this.voucher === Voucher.LIQUIDATION) {
            score += 0.5;
        }

        if (this.voucher === Voucher.HIEROGLYPH) {
            score += 0.5;
        }

        if (this.voucher === Voucher.PAINT_BRUSH) {
            score += 0.5;
        }

        if (this.voucher === Voucher.RECYCLOMANCY) {
            score += 0.5;
        }

        if (this.voucher === Voucher.GRABBER) {
            score += 0.5;
        }

        if (this.voucher === Voucher.WASTEFUL) {
            score += 0.2;
        }

        return score;
    }

    hasLegendary(...jokers: LegendaryJoker[]): boolean {
        if (this.legendaryJokers !== null) {
            for (const joker of jokers) {
                if (!this.legendaryJokers.has(joker.getName())) {
                    return false;
                }
            }
            return true;
        }

        this.legendaryJokers = new Set();

        const souls = this.countInPack(Specials.THE_SOUL);

        if (souls < jokers.length) return false;

        for (let i = 0; i < souls; i++) {
            this.legendaryJokers.add(this.game.nextJoker("sou", this.ante, false).joker.getName());
        }

        for (const joker of jokers) {
            if (!this.legendaryJokers.has(joker.getName())) {
                return false;
            }
        }

        return true;
    }

    hasInPack(item: ItemImpl): boolean {
        if (item instanceof LegendaryJoker) {
            return this.hasLegendary(item);
        }

        for (const packInfo of this.packInfos) {
            if (packInfo.containsOption(item.getName())) {
                return true;
            }
        }
        return false;
    }

    hasPack(packType: PackType): boolean {
        return this.packInfos.some(packInfo => packInfo.getType() === packType);
    }

    hasInSpectral(item: ItemImpl): boolean {
        if (item instanceof LegendaryJoker) {
            return this.hasLegendary(item);
        }

        for (const packInfo of this.packInfos) {
            if (packInfo.getKind() !== PackKind.SPECTRAL) {
                continue;
            }

            if (packInfo.containsOption(item.getName())) {
                return true;
            }
        }
        return false;
    }

    hasVoucher(voucher: Voucher): boolean {
        return this.voucher === voucher;
    }

    countInPack(item: ItemImpl): number {
        if (item instanceof LegendaryJoker) {
            item = Specials.THE_SOUL;
        }

        return this.packInfos.reduce((count, packInfo) => {
            return count + (packInfo.containsOption(item.getName()) ? 1 : 0);
        }, 0);
    }

    hasInBuffonPack(item: ItemImpl): boolean {
        return this.packInfos.some(packInfo => packInfo.getKind() === PackKind.BUFFOON && packInfo.containsOption(item.getName()));
    }

    getAnte(): number {
        return this.ante;
    }

    getShop(): Set<string> {
        return new Set(this.shop);
    }

    getShopQueue(): ShopQueue {
        return new ShopQueue(this.shopQueue);
    }

    getTags(): Set<Tag> {
        return new Set(this.tags);
    }

    getVoucher(): Voucher | undefined {
        return this.voucher;
    }

    getBoss(): Boss | undefined {
        return this.boss;
    }

    getPacks(): PackInfo[] {
        return [...this.packInfos];
    }

    getJokers(): Set<JokerImpl> {
        return new Set(this.shopQueue.filter(item => item.getItem() instanceof JokerImpl).map(item => item.getItem() as JokerImpl));
    }

    getRareJokers(): Set<JokerImpl> {
        return new Set(this.shopQueue.filter(item => item.getItem() instanceof JokerImpl && (item.getItem() as JokerImpl).isRare()).map(item => item.getItem() as JokerImpl));
    }

    getUncommonJokers(): Set<JokerImpl> {
        return new Set(this.shopQueue.filter(item => item.getItem() instanceof JokerImpl && (item.getItem() as JokerImpl).isUncommon()).map(item => item.getItem() as JokerImpl));
    }

    getNegativeJokerCount(): number {
        return this.shopQueue.filter(item => item.hasEdition(Edition.NEGATIVE) && item.getItem() instanceof JokerImpl).length;
    }

    getTarots(): Set<Tarot> {
        return new Set(this.shopQueue.filter(item => item.getItem() instanceof Tarot).map(item => item.getItem() as Tarot));
    }

    getPlanets(): Set<PlanetItem> {
        return new Set(this.shopQueue.filter(item => item.getItem() instanceof PlanetItem).map(item => item.getItem() as PlanetItem));
    }

    getStandardPackCount(): number {
        return this.packInfos.filter(packInfo => packInfo.getKind() === PackKind.STANDARD).length;
    }

    getJokerPackCount(): number {
        return this.packInfos.filter(packInfo => packInfo.getKind() === PackKind.BUFFOON).length;
    }

    getSpectralPackCount(): number {
        return this.packInfos.filter(packInfo => packInfo.getKind() === PackKind.SPECTRAL).length;
    }

    getTarotPackCount(): number {
        return this.packInfos.filter(packInfo => packInfo.getKind() === PackKind.ARCANA).length;
    }

    getPlanetPackCount(): number {
        return this.packInfos.filter(packInfo => packInfo.getKind() === PackKind.CELESTIAL).length;
    }
}