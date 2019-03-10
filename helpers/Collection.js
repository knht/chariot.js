const Eris = require('eris');

/**
 * Extremely simple customization of Eris' Collections giving the possibility to add more
 * Collection methods down the road if ever needed.
 */
class Collection extends Eris.Collection {
    constructor(baseObject, limit) {
        super(baseObject, limit);
    }
}

module.exports = Collection;