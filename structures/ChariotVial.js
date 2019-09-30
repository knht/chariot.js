const Util = require('../helpers/Util');

/**
 * Store any data indefinitely and reliably with additional utility methods.
 * @extends Map 
 * @property {Array<*>} first Get the first item of this Vial
 * @property {Array<*>} last Get the last item of this Vial
 */
class ChariotVial extends Map {
    constructor() {
        super();
    }

    get first() {
        return (this.size !== 0) ? this.entries().next().value : null;
    }

    get last() {
        return (this.size !== 0) ? Array.from(this)[this.size - 1] : null;
    }

    /**
     * @private
     * @param {*} anything Anything that needs to be stored inside the Vial
     * @returns {string} The object's Snowflake OR a randomly generated v4 UUID if no object with a Snowflake ID was provided for accessing the stored data again
     */
    _pourIn(anything) {
        let identifier;

        if (anything === void 0) {
            throw new Error('Cannot store empty value in Vial');
        }

        if (anything.id === void 0 || this.get(anything.id) !== void 0) {
            identifier = Util.uuidv4();
        } else {
            identifier = anything.id;
        }

        this.set(identifier, anything);

        return identifier;
    }

    /**
     * Store ANYTHING inside the vial. If it isn't a data structure with a set predefined ID, the Vial will generate a v4 UUID automatically.
     * If an object gets provided of which the Snowflake is already present in the Vial, the object will be stored nevertheless and gets a v4 UUID assigned!
     * 
     * @param {...*} anything Anything that needs to be stored inside the Vial. Can be as many arguments as needed
     * @returns {string | Array<string>} The object's Snowflake OR a randomly generated v4 UUID if no object with a Snowflake ID was provided if a single item was provided or an array containing all Snowflakes / UUIDs of all items
     */
    pourIn(...anything) {
        const identifiers = [];

        if (anything.length === 0) {
            throw new Error('Cannot store empty value in Vial');
        }

        anything.forEach((item) => identifiers.push(this._pourIn(item)));

        return (identifiers.length === 1) ? identifiers[0] : identifiers;
    }

    /**
     * Pour out any object or data structure previously added by their identifier.
     * Pouring an element of the Vial will permanently remove the item!
     * @param {string} identifier An item's identifier (Snowflake or v4 UUID)
     * @returns {* | null} The originally stored item inside the Vial or null if none was found
     */
    pourOut(identifier) {
        const drip = this.get(identifier);

        if (drip === void 0) {
            return null;
        }

        this.delete(identifier);

        return drip;
    }

    /**
     * Pour out every item the Vial holds, causing the Vial to return every item it holds and empty itself!
     * This method will DELETE every item the Vial once held!
     * @returns {Array<*>} An array containing every item the Vial once held 
     */
    pourAll() {
        const brew = [];

        for (const drip of this.entries()) {
            brew.push(drip[1]);
            this.delete(drip[0]);
        }

        return brew;
    }

    /**
     * Test whether the Vial has at least one element satisfying the condition
     * @param {function} probe A testing function that returns true or false 
     * @returns {Boolean} True if the Vial includes at least one element satisfying the probe's condition, otherwise false
     */
    incorporates(probe) {
        for (const drip of this.values()) {
            try {
                if (probe(drip)) {
                    return true;
                }
            } catch (dripTypeException) {
                continue;
            }
        }

        return false;
    }

    /**
     * Test whether ALL of the stored items within the Vial satisfy the probe's condition
     * @param {function} probe A testing function that returns true or false 
     * @returns {Boolean} True if the Vial includes ONLY elements satisfying the probe's condition, otherwise false
     */
    incorporatesAll(probe) {
        for (const drip of this.values()) {
            try {
                if (!probe(drip)) {
                    return false;
                }
            } catch (dripTypeException) {
                continue;
            }
        }

        return true;
    }

    /**
     * Runs an operator on each item of the Vial and returns a merged resulting value
     * @param {function} operator A function that takes the previous and next item and returns a new resulting value
     * @param {*} [initialDrip] An initial value passed to the operator. If left out the first item of the Vial will be taken
     * @returns {*} A merged item resulting from running the operator on all items in the Vial
     */
    merge(operator, initialDrip) {
        const drips = this.values();
        let drip = void 0;
        let brew = initialDrip === void 0 ? drips.next().value : initialDrip;

        while ((drip = drips.next().value) !== void 0) {
            brew = operator(brew, drip);
        }

        return brew;
    }

    /**
     * Apply an operator on every item of the Vial and return the resulting items in an array
     * @param {function} operator A function taking an item from the Vial and returning a new element
     * @returns {Array<*>} An array containing all new applied items of the Vial
     */
    apply(operator) {
        const blend = [];

        for (const drip of this.values()) {
            blend.push(operator(drip));
        }

        return blend;
    }

    /**
     * Filter the entire Vial for items making the provided operator function evalute true
     * @param {function} operator A function taking an item from the Vial and returning true if it matches
     * @returns {Array<*> | null} An array containing all filtered items or null if none were found
     */
    filter(operator) {
        const blend = [];

        for (const drip of this.values()) {
            if (operator(drip))  {
                blend.push(drip);
            }
        }

        return (blend.length === 0) ? null : blend;
    }

    /**
     * Get a certain element from the Vial making the provided operator function evaluate true
     * @param {function} operator A function taking an item from the Vial and returning true if it matches
     * @returns {* | null} A found element from the Vial or null if none were found 
     */
    obtain(operator) {
        for (const drip of this.values()) {
            if (operator(drip)) {
                return drip;
            }
        }

        return null;
    }

    /**
     * Get a random element from the Vial
     * @returns {* | null} A random element or null if the Vial is empty
     */
    obtainRandom() {
        if (this.size === 0) return null;

        return this.get([...this.keys()][Math.floor(Math.random() * this.size)]);
    }
}

module.exports = ChariotVial;